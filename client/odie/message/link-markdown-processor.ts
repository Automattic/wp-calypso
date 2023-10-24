/**
 * Extracts link data from a markdown string.
 * @param markdown - The markdown string to extract link data from.
 * @returns An object containing the URL and title of the link, or null if no link was found.
 */
export const getLinkDataFromMarkdown = (
	markdown: string
): { url: string; title: string } | null => {
	const match = markdown.match( /\[([^\]]+)\]\(([^)]+)\)/ );
	if ( ! match ) {
		return null;
	}

	return {
		url: match[ 2 ],
		title: match[ 1 ],
	};
};
