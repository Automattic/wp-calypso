import { ProgressBar } from '@automattic/components';
import { Title, Progress } from '@automattic/onboarding';
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
	onColorAnimationFinish: () => void;
}
const Colors: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { onColorAnimationFinish } = props;

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
		onColorAnimationFinish?.();
	}

	return (
		<div className="import-layout__center import-light__colors">
			<div className="import__heading-center">
				<Progress>
					<Title>{ __( 'Importing colors' ) }</Title>
					<ProgressBar value={ 67 } compact={ true } />
					<div className="colors-container">
						{ displayedColors.map( ( x, i ) => (
							<ColorIndicator key={ i } colorValue={ x.hex } />
						) ) }
					</div>
				</Progress>
			</div>
		</div>
	);
};

export default Colors;
