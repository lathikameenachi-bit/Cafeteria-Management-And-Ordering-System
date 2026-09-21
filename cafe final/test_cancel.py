import urllib.request
import json
url = 'http://127.0.0.1:5000/api/orders/2/cancel'
req = urllib.request.Request(url, method='PUT')
req.add_header('X-User-Username', 'canceluser')
try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
