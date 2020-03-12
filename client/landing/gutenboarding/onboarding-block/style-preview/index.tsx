/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Preview from './preview';
import Link from '../../components/link';
import { usePath, Step } from '../../path';
import { useI18n } from '@automattic/react-i18n';
import ViewportSelect, { Viewport } from './viewport-select';

import './style.scss';

const fontPairings = [
	[ 'Cabin', 'Raleway' ],
	[ 'Chivo', 'OpenSans' ],
	[ 'Playfair', 'FiraSans' ],
	[ 'Arvo', 'Montserrat' ],
	[ 'SpaceMono', 'Roboto' ],
];

const StylePreview: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const makePath = usePath();
	const [ selectedViewport, setSelectedViewport ] = React.useState< Viewport >( 'desktop' );
	return (
		<>
			<div className="gutenboarding-title">{ NO__( 'Select your fonts' ) }</div>
			<div className="gutenboarding-subtitle">
				{ NO__( 'Add some personality to your design.' ) }
			</div>
			<ViewportSelect selected={ selectedViewport } onSelect={ setSelectedViewport } />
			<div className="gutenboarding-actions">
				<Link isLink to={ makePath( Step.DesignSelection ) }>
					{ NO__( 'Choose another design' ) }
				</Link>
				<Button
					isPrimary
					onClick={ () => {
						window.alert( 'Not implemented!' );
					} }
				>
					{ NO__( 'Continue' ) }
				</Button>
			</div>
			<div className="style-preview__font-options">
				<ul>
					{ fontPairings.map( ( [ a, b ] ) => (
						<li key={ a + b }>
							<Button>
								{ a } / { b }
							</Button>
						</li>
					) ) }
				</ul>
			</div>
			<Preview />
		</>
	);
};

export default StylePreview;

interface ViewProps {
	isSelected: boolean;
}
