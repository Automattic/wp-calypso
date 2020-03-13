/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

import './style.scss';
import Link from '../../components/link';
import { usePath, Step } from '../../path';
import { useI18n } from '@automattic/react-i18n';
import { STORE_KEY } from '../../stores/onboard';

const StylePreview: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const makePath = usePath();
	const { selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	return (
		<>
			<div>
				<Link to={ makePath( Step.DesignSelection ) }>{ NO__( 'Choose another design' ) }</Link>
			</div>
			<div>You picked { selectedDesign?.title } design.</div>
			<p>Hi, I'm a style preview. I'm under construction</p>
		</>
	);
};

export default StylePreview;
