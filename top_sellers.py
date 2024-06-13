import subprocess
import threading
import pymysql
import logging
from threading import Lock

# Setup basic configuration for logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Database connection parameters
DB_HOST = '72.167.226.12'
DB_USER = 'dbadmin'
DB_PASS = '1Tgst32^1'
DB_NAME = 'Staging'
DB_PORT = 3306




# Use the IP address of your server and the credentials for the 'webadmin' user
restart_mysql_server_ssh('72.167.226.12', 'webadmin', 'your_generated_password')


# Connect to the MySQL database
conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME, port=DB_PORT)
try:
    with conn.cursor() as cursor:
        # Example query
        cursor.execute("SELECT VERSION();")
        result = cursor.fetchone()
        print("Database version:", result)
finally:
    conn.close()



# Function to fetch data for a range of IDs
def fetch_data(id_start, id_end, results):
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME, port=DB_PORT)
    try:
        with conn.cursor() as cursor:
            sql = """
            SELECT p.PartNumber, p.Description, pi.ImageFile, COUNT(oi.PartNumber) AS TotalSales
            FROM orderitems oi
            JOIN parts p ON p.PartNumber = oi.PartNumber
            JOIN partinfo pi ON p.PartNumber = pi.PartNumber
            WHERE pi.ImageFile IS NOT NULL AND p.ID BETWEEN %s AND %s
            GROUP BY p.PartNumber, p.Description, pi.ImageFile
            ORDER BY TotalSales DESC
            LIMIT 5;
            """
            cursor.execute(sql, (id_start, id_end))
            fetched_results = cursor.fetchall()
            with results_lock:
                results.extend(fetched_results)
            logging.info(f"Data fetched for range {id_start} to {id_end}: {fetched_results}")
    except Exception as e:
        logging.error(f"Error fetching data for range {id_start} to {id_end}: {e}")
    finally:
        conn.close()

# Define the ID ranges for parallel processing
id_ranges = [(1, 2500000), (2500001, 5000000), (5000001, 7500000), (7500001, 10000000)]
results = []
results_lock = Lock()
threads = []

# Create and start threads
for start, end in id_ranges:
    thread = threading.Thread(target=fetch_data, args=(start, end, results))
    threads.append(thread)
    thread.start()

# Wait for all threads to complete
for thread in threads:
    thread.join()

# After all threads complete, process the results
final_results = sorted(results, key=lambda x: x[3], reverse=True)[:5]
logging.info("Final aggregated results:")
for result in final_results:
    logging.info(result)
