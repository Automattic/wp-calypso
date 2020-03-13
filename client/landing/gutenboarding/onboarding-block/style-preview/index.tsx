/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import Preview from './preview';
import Link from '../../components/link';
import { usePath, Step } from '../../path';
import ViewportSelect from './viewport-select';
import FontSelect, { fontPairings } from './font-select';
import { Title, SubTitle } from '../../components/titles';
import * as T from './types';

import './style.scss';

const StylePreview: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const makePath = usePath();
	const [ selectedViewport, setSelectedViewport ] = React.useState< T.Viewport >( 'desktop' );
	const [ selectedFonts, setSelectedFonts ] = React.useState< ValuesType< typeof fontPairings > >(
		fontPairings[ 0 ]
	);
	return (
		<div className="style-preview">
			<div className="style-preview__header">
				<div className="style-preview__titles">
					<Title>{ NO__( 'Select your fonts' ) }</Title>
					<SubTitle>{ NO__( 'Add some personality to your design.' ) }</SubTitle>
				</div>
				<ViewportSelect selected={ selectedViewport } onSelect={ setSelectedViewport } />
				<div className="style-preview__actions">
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
			</div>
			<div className="style-preview__content">
				<FontSelect selected={ selectedFonts } onSelect={ setSelectedFonts } />
				<Preview fonts={ selectedFonts } viewport={ selectedViewport } />
			</div>
		</div>
	);
};

export default StylePreview;

interface ViewProps {
	isSelected: boolean;
}
