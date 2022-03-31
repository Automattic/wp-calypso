import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React, { ReactElement } from 'react';

type Props = {
	url: string;
};

const BlockDescriptionLink = ( { url }: Props ) => {
	// This was cooked up to only apply the link in the BlockEditor sidebar.
	// Since there was no identifier in the environment to differentiate.
	const [ ref, setRef ] = React.useState< any >();

	if ( ref && ! ref?.closest( '.block-editor-block-inspector' ) ) {
		return null;
	}

	return (
		<>
			<br />
			<ExternalLink
				ref={ ( reference ) => ref !== reference && setRef( reference ) }
				style={ { display: 'block', paddingTop: 10 } }
				className={ 'fse-inline-support-link' }
				href={ url }
			>
				{ __( 'Learn more', 'full-site-editing' ) }
			</ExternalLink>
		</>
	);
};

export const inlineBlockDescriptionLink = ( description: string | ReactElement, url: string ) => {
	return createInterpolateElement( description + '<BlockDescriptionLink/>', {
		span: <span />,
		BlockDescriptionLink: <BlockDescriptionLink url={ url } />,
	} );
};
