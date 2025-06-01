// Use a simpler, public domain KJV API
const API_BASE_URL = 'https://bible-api.com';

// Helper function to clean and validate verse references
function normalizeReference(reference: string): string {
  // Remove any translation specifications
  let normalized = reference
    .replace(/\b(niv|kjv|nasb|nlt|esv)\b/gi, '')  // Remove translation markers
    .replace(/\s+/g, ' ')                          // Normalize spaces
    .replace(/(\d+)[:.]\s*(\d+)/g, '$1:$2')       // Standardize chapter:verse format
    .replace(/(\d+)\s+(\d+)/g, '$1:$2')           // Convert "chapter verse" to "chapter:verse"
    .trim();

  // Validate basic reference format
  const referencePattern = /^[\w\s]+ \d+:\d+(-\d+)?$/i;
  if (!referencePattern.test(normalized)) {
    throw new Error(
      'Invalid verse reference format.\n' +
      'Please use one of these formats:\n' +
      '- Single verse: "John 3:16"\n' +
      '- Verse range: "Romans 8:28-29"\n' +
      '- Multiple verses: "Psalm 23:1-6"'
    );
  }

  return normalized;
}

export async function getVerseContent(reference: string): Promise<string> {
  try {
    // Normalize and validate the reference
    const normalizedRef = normalizeReference(reference);
    
    // Encode the reference for the URL
    const encodedRef = encodeURIComponent(normalizedRef);
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/${encodedRef}?translation=kjv`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch verse (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error('Verse content not found');
    }

    // Clean up the verse text
    const cleanContent = data.text
      .replace(/\s+/g, ' ')    // Normalize spaces
      .replace(/^\s+|\s+$/g, '') // Trim start and end
      .replace(/\n/g, ' ');    // Remove newlines
    
    return cleanContent;
  } catch (error) {
    console.error('Error fetching verse:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load the verse');
  }
}