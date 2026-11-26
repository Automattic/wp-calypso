import { getDataCenterOptions } from '@automattic/api-core';
import { siteDataCenterQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
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
	const sourceSlug = searchParams.get( 'sourceSlug' ) ?? undefined;
	const { data: sourceSite } = useSiteQuery( sourceSlug, { enabled: !! sourceSlug } );
	// Backends without this endpoint also ignore a data center for the copy, so there's nothing to offer.
	const { data: sourceDataCenter } = useQuery( {
		...siteDataCenterQuery( sourceSite?.ID ?? 0 ),
		enabled: !! sourceSite?.ID,
	} );

	const current = sourceDataCenter?.current ?? null;
	const others = ( sourceDataCenter?.available ?? [] ).filter( ( option ) => option !== current );

	if ( ! others.length ) {
		return null;
	}

	const setDataCenter = ( value: string ) => {
		setSearchParams(
			( params ) => {
				const next = new URLSearchParams( params );
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

	const dataCenterOptions = getDataCenterOptions();

	return (
		<div className="copy-site-data-center-choice">
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Data center for the copy' ) }
				help={ __(
					'Pick the one closest to most of your visitors. The original site stays where it is.'
				) }
				value={ dataCenter && others.includes( dataCenter ) ? dataCenter : '' }
				options={ [
					{
						label: current
							? sprintf(
									/* translators: %s: a data center, e.g. "US Central (Dallas-Fort Worth, Texas)". */
									__( 'Same as the original site: %s' ),
									dataCenterOptions[ current ]
								)
							: __( 'Same as the original site' ),
						value: '',
					},
					...others.map( ( option ) => ( {
						label: dataCenterOptions[ option ],
						value: option,
					} ) ),
				] }
				onChange={ setDataCenter }
			/>
		</div>
	);
}
