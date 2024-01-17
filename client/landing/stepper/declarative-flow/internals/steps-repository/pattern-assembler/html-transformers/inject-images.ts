export default function injectImages( patternHtml: string, imageURLs: string[] ) {
	return patternHtml.replace(
		/<img src="(?<url>http[^"]+)"(?<params>.*?)>/g,
		( match, url, params ) => {
			const randomIndex = Math.floor( Math.random() * imageURLs.length );
			const imageURL = imageURLs[ randomIndex ];
			return `<img src="${ imageURL }" ${ params }>`;
		}
	);
}
