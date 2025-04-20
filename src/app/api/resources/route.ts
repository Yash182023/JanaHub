// src/app/api/resources/route.ts
import { NextResponse } from 'next/server';
import { fetchStrapiData } from '@/lib/strapi'; // Import your fetch utility

// Define interfaces here too for clarity or import them if shared
interface Helpline { id: number; name: string; number: string; description: any; scope: string; languages: string; createdAt: string; updatedAt: string; publishedAt: string; }
interface Ngo { id: number; name: string; description: any; services_offered: any; phone_number?: string; email?: string; website?: string; address_line1?: string; city: string; state: string; pincode?: string; createdAt: string; updatedAt: string; publishedAt: string; }
interface LegalResource {
    id: number;
    title: string;
    summary_of_law: any; // Assuming rich text or long text
    relevant_sections: any;
    procedure_for_reporting: any;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export async function GET(request: Request) {
    // This code runs ONLY on the server
    console.log("Route Handler: Fetching resources from Strapi (including legal)...");

    try {
        const results = await Promise.allSettled([
            fetchStrapiData({ endpoint: '/helplines', wrappedByKey: 'data' }),
            fetchStrapiData({ endpoint: '/ngos', wrappedByKey: 'data' }),
            // --- NEW: Fetch Legal Resources ---
            fetchStrapiData({ endpoint: '/legalresources', wrappedByKey: 'data' }) // Adjust endpoint if needed
        ]);

        const helplines = results[0].status === 'fulfilled' ? results[0].value : [];
        const ngos = results[1].status === 'fulfilled' ? results[1].value : [];
        // --- NEW: Extract Legal Resources ---
        const legalResources: LegalResource[] = results[2].status === 'fulfilled' ? results[2].value : [];

        const errorMessages = results
            .filter(r => r.status === 'rejected')
            .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown fetch error');

        console.log(`Route Handler: Fetched ${helplines.length} helplines, ${ngos.length} NGOs, ${legalResources.length} legal resources.`);
        if (errorMessages.length > 0) {
             console.warn("Route Handler: Errors occurred during fetch:", errorMessages);
        }

        // Return the data including legal resources
        return NextResponse.json({
            helplines,
            ngos,
            legalResources, // --- Include in response ---
            errors: errorMessages.length > 0 ? errorMessages : null,
        });

    } catch (error: any) {
        console.error("Route Handler: Critical error fetching resources:", error);
        return NextResponse.json(
            { error: 'Failed to load resources from server.' },
            { status: 500 }
        );
    }
}