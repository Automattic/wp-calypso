import { Button } from '@wordpress/components';
import { PinnedItems } from '@wordpress/interface';
import { registerPlugin } from '@wordpress/plugins';
import { hasQueryArg } from '@wordpress/url';
import cx from 'classnames';
import React from 'react';
import './use-help-center.scss';

const HelpIcon = ( { newItems, active } ) => (
	<svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle
			cx="12"
			cy="12.5"
			r="8"
			stroke={ active ? 'white' : '#1e1e1e' }
			fill={ active ? '#1e1e1e' : 'white' }
			stroke-width="1.5"
		/>
		<path
			d="M9.75 10.75C9.75 9.50736 10.7574 8.5 12 8.5C13.2426 8.5 14.25 9.50736 14.25 10.75C14.25 11.9083 13.3748 12.8621 12.2496 12.9863C12.1124 13.0015 12 13.1119 12 13.25V14.5"
			stroke={ active ? 'white' : '#1e1e1e' }
			stroke-width="1.5"
			fill="none"
		/>
		<path d="M12 15.5V17" stroke={ active ? 'white' : '#1e1e1e' } stroke-width="1.5" />
		{ newItems && (
			<circle
				cx="20"
				cy="8"
				r="5"
				stroke={ active ? '#1e1e1e' : 'white' }
				fill="#0675C4"
				stroke-width="2"
			/>
		) }
	</svg>
);

function HelpCenter() {
	const [ isActive, setIsActive ] = React.useState( false );

	return (
		<>
			<PinnedItems scope="core/edit-post">
				<span className="use-help-center">
					<Button
						className={ cx( 'entry-point-button', { 'is-active': isActive } ) }
						onClick={ () => setIsActive( ! isActive ) }
						icon={ <HelpIcon newItems active={ isActive } /> }
					></Button>
				</span>
			</PinnedItems>
			{ /*
			 the floating container could be here
			 */ }
		</>
	);
}

if ( hasQueryArg( globalThis.location.href, 'enable-help-center' ) ) {
	registerPlugin( 'wpcom-help-center', {
		render: () => <HelpCenter />,
	} );
}
