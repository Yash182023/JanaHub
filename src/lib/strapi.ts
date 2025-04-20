import qs from 'qs'; // We'll install this next

interface StrapiFetchParams {
    endpoint: string; // e.g., '/helplines', '/ngos'
    query?: Record<string, any>; // For Strapi query parameters (filtering, sorting, population)
    wrappedByKey?: string; // Optional key if data is wrapped like { data: [...] }
    wrappedByList?: boolean; // Optional flag if the response is a list like [{...}, {...}]
}

// Central function to fetch data from Strapi
export async function fetchStrapiData({
    endpoint,
    query,
    wrappedByKey = 'data', // Strapi default wraps collections in 'data'
    wrappedByList = false,
}: StrapiFetchParams): Promise<any> {

    // Get Strapi URL and Token from environment variables
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const strapiToken = process.env.STRAPI_API_TOKEN;

    if (!strapiUrl) {
        console.error('Error: NEXT_PUBLIC_STRAPI_API_URL is not defined.');
        throw new Error('Strapi API URL is not configured.');
    }
    if (!strapiToken) {
        // This check might still be useful if you accidentally call this from client again
        // But the primary call path (Route Handler) should always have it.
        console.error('CRITICAL ERROR: STRAPI_API_TOKEN is not defined. Ensure this function is called server-side.');
        // Maybe throw an error here now, as it indicates a setup problem
        throw new Error('STRAPI_API_TOKEN is missing in server environment.');
    }

    // Build the full URL with query parameters
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const requestUrl = `${strapiUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    console.log(`Fetching Strapi data from: ${requestUrl}`); // For debugging

    // Prepare headers, including Authorization if token exists
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (strapiToken) {
        headers['Authorization'] = `Bearer ${strapiToken}`;
    }

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: headers,
            cache: 'no-store', // Ensure fresh data, or configure caching as needed later
            // next: { revalidate: 60 } // Or use Next.js incremental static regeneration (ISR)
        });

        if (!response.ok) {
            console.error(`Strapi fetch error: ${response.status} ${response.statusText}`);
            console.error(`URL: ${requestUrl}`);
            const errorBody = await response.text();
            console.error(`Error Body: ${errorBody}`);
            throw new Error(`Failed to fetch Strapi data: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle Strapi's data wrapping conventions
        if (wrappedByKey && data[wrappedByKey]) {
            return data[wrappedByKey];
        }
        if (wrappedByList) {
           return data; // Return the raw list if specified
        }
        // If not wrapped as expected, return the raw data but log a warning
        console.warn(`Strapi data for ${endpoint} might not be wrapped as expected. Returning raw data.`);
        return data;

    } catch (error) {
        console.error('Error fetching Strapi data:', error);
        // Rethrow or handle appropriately for your application
        throw error;
    }
}