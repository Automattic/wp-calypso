import { renderToString } from '@wordpress/element';
import { useMemo } from 'react';

const useParsedAssets = ( html: string ) => {
	return useMemo( () => {
		const doc = document.implementation.createHTMLDocument( '' );
		doc.body.innerHTML = html;
		return Array.from( doc.body.children );
	}, [ html ] );
};

interface Props {
	html: string;
}

export const PreloadStyleAssets = ( { html }: Props ) => {
	const styles = useParsedAssets( html ) as HTMLLinkElement[];
	const styleAssets = (
		<>
			{ styles.map( ( { tagName, href, id, rel, media, textContent } ) => {
				const TagName = tagName.toLowerCase();

				if ( TagName === 'style' ) {
					return (
						<TagName { ...{ id } } key={ id }>
							{ textContent }
						</TagName>
					);
				}

				return <TagName { ...{ href, id, rel, media } } key={ id } />;
			} ) }
		</>
	);

	const srcDoc = useMemo( () => {
		return '<!doctype html>' + renderToString( styleAssets );
	}, [] );

	return (
		<iframe
			srcDoc={ srcDoc }
			title="Preload styles"
			tabIndex={ -1 }
			style={ { display: 'none' } }
		/>
	);
};
