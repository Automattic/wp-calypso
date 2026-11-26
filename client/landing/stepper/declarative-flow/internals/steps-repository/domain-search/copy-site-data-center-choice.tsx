import { getDataCenterOptions } from '@automattic/api-core';
import { Button, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	COPY_SITE_DATA_CENTER_PARAM,
	getCopySiteDataCenter,
} from 'calypso/landing/stepper/utils/copy-site-data-center';

import './copy-site-data-center-choice.scss';

export default function CopySiteDataCenterChoice() {
	const { __ } = useI18n();
	const [ searchParams, setSearchParams ] = useSearchParams();
	const dataCenter = getCopySiteDataCenter( searchParams );
	const [ isPickerShowing, setIsPickerShowing ] = useState( !! dataCenter );

	const setDataCenter = ( value: string ) => {
		setSearchParams(
			( current ) => {
				const next = new URLSearchParams( current );
				if ( value ) {
					next.set( COPY_SITE_DATA_CENTER_PARAM, value );
				} else {
					next.delete( COPY_SITE_DATA_CENTER_PARAM );
				}
				return next;
			},
			{ replace: true }
		);
	};

	if ( ! isPickerShowing ) {
		return (
			<p className="copy-site-data-center-choice">
				{ createInterpolateElement(
					__(
						'Your copy will be hosted in the same data center as the original site. <button>Choose a different data center</button>'
					),
					{
						button: <Button variant="link" onClick={ () => setIsPickerShowing( true ) } />,
					}
				) }
			</p>
		);
	}

	return (
		<div className="copy-site-data-center-choice">
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Data center for the copy' ) }
				help={ __(
					'Pick the one closest to most of your visitors. The original site stays where it is.'
				) }
				value={ dataCenter ?? '' }
				options={ [
					{ label: __( 'Same as the original site' ), value: '' },
					...Object.entries( getDataCenterOptions() ).map( ( [ value, label ] ) => ( {
						label,
						value,
					} ) ),
				] }
				onChange={ setDataCenter }
			/>
		</div>
	);
}
