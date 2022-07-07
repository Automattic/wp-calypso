import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, JSXElementConstructor, ReactElement } from 'react';

interface Props {
	children: string | ReactElement< string | JSXElementConstructor< any > >;
	title: string;
	url: string;
}
export default function DescriptionSupportLink( { children, title, url }: Props ): JSX.Element {
	// This was cooked up to only apply the link in the BlockEditor sidebar.
	// Since there was no identifier in the environment to differentiate.
	const [ ref, setRef ] = useState< Element | null >();

	if ( ref && ! ref?.closest( '.block-editor-block-inspector' ) ) {
		return children as JSX.Element;
	}

	return (
		<>
			{ children }
			<br />
			<ExternalLink
				onClick={ () => {
					recordTracksEvent( 'calypso_block_description_support_link_click', {
						block: title,
						support_link: url,
					} );
				} }
				ref={ ( reference ) => ref !== reference && setRef( reference ) }
				style={ { display: 'block', marginTop: 10, maxWidth: 'fit-content' } }
				className="fse-inline-support-link"
				href={ url }
			>
				{ __( 'Learn more', 'full-site-editing' ) }
			</ExternalLink>
		</>
	);
}
