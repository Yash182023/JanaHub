// // src/app/api/resources/route.ts
// import { NextResponse } from 'next/server';
// import { fetchStrapiData } from '@/lib/strapi'; // Import your fetch utility

// // Define interfaces here too for clarity or import them if shared
// interface Helpline { id: number; name: string; number: string; description: any; scope: string; languages: string; createdAt: string; updatedAt: string; publishedAt: string; }
// interface Ngo { id: number; name: string; description: any; services_offered: any; phone_number?: string; email?: string; website?: string; address_line1?: string; city: string; state: string; pincode?: string; createdAt: string; updatedAt: string; publishedAt: string; }
// interface LegalResource {
//     id: number;
//     title: string;
//     summary_of_law: any; // Assuming rich text or long text
//     relevant_sections: any;
//     procedure_for_reporting: any;
//     createdAt: string;
//     updatedAt: string;
//     publishedAt: string;
// }

// export async function GET(request: Request) {
//     // This code runs ONLY on the server
//     console.log("Route Handler: Fetching resources from Strapi (including legal)...");

//     try {
//         const results = await Promise.allSettled([
//             fetchStrapiData({ endpoint: '/helplines', wrappedByKey: 'data' }),
//             fetchStrapiData({ endpoint: '/ngos', wrappedByKey: 'data' }),
//             // --- NEW: Fetch Legal Resources ---
//             fetchStrapiData({ endpoint: '/legalresources', wrappedByKey: 'data' }) // Adjust endpoint if needed
//         ]);

//         const helplines = results[0].status === 'fulfilled' ? results[0].value : [];
//         const ngos = results[1].status === 'fulfilled' ? results[1].value : [];
//         // --- NEW: Extract Legal Resources ---
//         const legalResources: LegalResource[] = results[2].status === 'fulfilled' ? results[2].value : [];

//         const errorMessages = results
//             .filter(r => r.status === 'rejected')
//             .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown fetch error');

//         console.log(`Route Handler: Fetched ${helplines.length} helplines, ${ngos.length} NGOs, ${legalResources.length} legal resources.`);
//         if (errorMessages.length > 0) {
//              console.warn("Route Handler: Errors occurred during fetch:", errorMessages);
//         }

//         // Return the data including legal resources
//         return NextResponse.json({
//             helplines,
//             ngos,
//             legalResources, // --- Include in response ---
//             errors: errorMessages.length > 0 ? errorMessages : null,
//         });

//     } catch (error: any) {
//         console.error("Route Handler: Critical error fetching resources:", error);
//         return NextResponse.json(
//             { error: 'Failed to load resources from server.' },
//             { status: 500 }
//         );
//     }
// }
// src/app/api/resources/route.ts
import { NextResponse } from 'next/server';
import { fetchStrapiData } from '@/lib/strapi';

// --- Define Interfaces (Consider moving to a shared types file later) ---
interface StrapiRichTextBlock { // Basic type for rich text, adjust if needed
    type: string;
    children: { type: string; text: string }[];
}

interface StrapiEntity {
    id: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

interface Helpline extends StrapiEntity {
    name: string;
    number: string;
    description: StrapiRichTextBlock[] | null; // Use specific type or null
    scope: string;
    languages: string;
}
interface Ngo extends StrapiEntity {
    name: string;
    description: StrapiRichTextBlock[] | null;
    services_offered: StrapiRichTextBlock[] | null;
    phone_number?: string | null;
    email?: string | null;
    website?: string | null;
    address_line1?: string | null;
    city: string;
    state: string;
    pincode?: string | null;
}
interface LegalResource extends StrapiEntity {
    title: string;
    summary_of_law: StrapiRichTextBlock[] | null;
    relevant_sections: StrapiRichTextBlock[] | null;
    procedure_for_reporting: StrapiRichTextBlock[] | null;
}
// --- End Interfaces ---

// Use `_request` to indicate it's unused but required by the function signature
export async function GET(_request: Request) {
    console.log("Route Handler: Fetching resources from Strapi (including legal)...");

    try {
        const results = await Promise.allSettled([
            fetchStrapiData({ endpoint: '/helplines', wrappedByKey: 'data' }),
            fetchStrapiData({ endpoint: '/ngos', wrappedByKey: 'data' }),
            fetchStrapiData({ endpoint: '/legal-resources', wrappedByKey: 'data' })
        ]);

        // Explicitly type the extracted data
        const helplines: Helpline[] = results[0].status === 'fulfilled' ? results[0].value as Helpline[] : [];
        const ngos: Ngo[] = results[1].status === 'fulfilled' ? results[1].value as Ngo[] : [];
        const legalResources: LegalResource[] = results[2].status === 'fulfilled' ? results[2].value as LegalResource[] : [];


        const errorMessages = results
            .filter(r => r.status === 'rejected')
            .map(r => ((r as PromiseRejectedResult).reason as Error)?.message || 'Unknown fetch error'); // Type assertion for reason


        console.log(`Route Handler: Fetched ${helplines.length} helplines, ${ngos.length} NGOs, ${legalResources.length} legal resources.`);
        if (errorMessages.length > 0) {
             console.warn("Route Handler: Errors occurred during fetch:", errorMessages);
        }

        return NextResponse.json({
            helplines,
            ngos,
            legalResources,
            errors: errorMessages.length > 0 ? errorMessages : null,
        });

    } catch (error: unknown) { // Use 'unknown' for catch block error type
        console.error("Route Handler: Critical error fetching resources:", error);
        const message = error instanceof Error ? error.message : 'Failed to load resources from server.'; // Extract message safely
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}