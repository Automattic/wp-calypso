import { Title } from '@automattic/onboarding';
import { ColorIndicator } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Color {
	name: string;
	hex: string;
}

interface Props {
	colors: Color[];
}
const Scanning: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();

	const [ colors ] = useState( props.colors );
	const [ displayedColors, setDisplayedColors ] = useState< Color[] >( [] );

	// Display colors one by one
	useEffect( () => {
		const interval = setInterval( () => {
			setDisplayedColors( ( displayedColors ) => {
				if ( displayedColors.length === colors.length ) {
					clearInterval( interval );
					onColorsDisplay();
				}
				return colors.slice( 0, displayedColors.length + 1 );
			} );
		}, 200 );

		return () => clearInterval( interval );
	}, [ colors ] );

	function onColorsDisplay() {
		// redirect to the next step/screen
	}

	return (
		<div className="import-layout__center import-light__colors">
			<div className="import__header">
				<div className="import__heading-center">
					<Title>{ __( 'Importing colors' ) }</Title>

					<div className="colors-container">
						{ displayedColors.map( ( x, i ) => (
							<ColorIndicator key={ i } colorValue={ x.hex } />
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default Scanning;
