
// Native fetch is available in Node 18+
// If running on older node, might need node-fetch, but let's try native first as it's cleaner
// or use simple http if needed. But let's assume standard ESM environment.

async function testSearch() {
  try {
    console.log("Running search test...");
    const response = await fetch('http://localhost:3000/api/search_medicine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicine_name: 'paracetamol',
        latitude: 17.313509,
        longitude: 76.812161
      })
    });

    const data = await response.json();
    console.log('StatusCode:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testSearch();
