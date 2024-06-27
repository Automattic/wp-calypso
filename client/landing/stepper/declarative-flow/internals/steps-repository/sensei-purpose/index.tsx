import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React, { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { SenseiStepProgress } from '../components/sensei-step-progress';
import PurposeItem from './purpose-item';
import {
	clearSelectedPurposes,
	SitePurpose,
	purposes as purposeOptions,
	setSelectedPurposes,
} from './purposes';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

type ResponseError = {
	error: string;
};

const setCourseTheme = async ( site: number, variation: string | null = null ) =>
	wpcomRequest( {
		path: `/sites/${ site }/themes/mine`,
		method: 'POST',
		apiVersion: '1.1',
		body: {
			theme: 'course',
			...( variation && { style_variation_slug: variation } ),
		},
	} );

const installCourseTheme = async ( siteId: number ) =>
	wpcom.req.post( { path: `/sites/${ siteId }/themes/course/install` } );

const SenseiPurpose: Step = ( { navigation: { submit } } ) => {
	const [ progress, setProgress ] = useState< number >( 0 );
	const urlParams = new URLSearchParams( window.location.search );
	const siteId = parseInt( urlParams.get( 'siteId' ) ?? '0' );
	const selectedVariation = urlParams.get( 'variation' ) ?? 'green';

	useEffect( () => {
		clearSelectedPurposes();
	}, [] );

	// Stall for a few seconds while the atomic transfer is going on.
	useEffect( () => {
		const installTheme = async () => {
			await wait( 3000 );
			if ( progress === 100 ) {
				return;
			}

			try {
				await installCourseTheme( siteId );
				await setCourseTheme( siteId, selectedVariation );
				setProgress( 100 );
			} catch ( responseError: unknown ) {
				if ( ( responseError as ResponseError )?.error === 'theme_already_installed' ) {
					await setCourseTheme( siteId, selectedVariation );
					setProgress( 100 );
				} else {
					setProgress(
						( prevProgress ) =>
							prevProgress + Math.min( 15, prevProgress + ( 100 - prevProgress ) / 2 )
					);
				}
			}
		};

		installTheme();
	}, [ siteId, progress, selectedVariation ] );

	const waiting = progress < 100;

	const [ sitePurpose, setSitePurpose ] = useState< SitePurpose >( {
		selected: [],
		other: '',
	} );
	const { selected, other } = sitePurpose;

	const isEmpty = ! selected.length;

	const toggleItem = ( id: string ) => {
		const wasSelected = selected.includes( id );
		const newSelection = wasSelected
			? selected.filter( ( item ) => item !== id )
			: [ id, ...selected ];
		setSitePurpose( ( purposeFormState ) => ( {
			...purposeFormState,
			selected: newSelection,
		} ) );
	};

	const submitPage = async () => {
		setSelectedPurposes( sitePurpose );
		submit?.();
	};

	const title = __( 'Choose the purpose of your site' );

	return (
		<SenseiStepContainer
			stepName="senseiPurpose"
			className="sensei-step-green"
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					headerText={ title }
					subHeaderText={ __(
						'Select your goals for offering courses, and we will help you set everything up.'
					) }
				></FormattedHeader>
			}
		>
			{ waiting && (
				<SenseiStepProgress
					progress={ {
						percentage: progress,
						title: __( 'Order was completed successfully' ),
						subtitle: __( 'Preparing your new site' ),
					} }
				/>
			) }
			{ ! waiting && (
				<>
					<DocumentHead title={ title } />
					<div className="sensei-setup-wizard__purpose-container">
						<ul className="sensei-setup-wizard__purpose-list">
							{ purposeOptions.map( ( { id, label, description } ) => (
								<PurposeItem
									key={ id }
									label={ label }
									checked={ selected.includes( id ) }
									onToggle={ () => toggleItem( id ) }
								>
									{ description && (
										<span className="sensei-setup-wizard__purpose-description">
											{ description }
										</span>
									) }
								</PurposeItem>
							) ) }

							<PurposeItem
								label={ __( 'Other' ) }
								checked={ selected.includes( 'other' ) }
								onToggle={ () => toggleItem( 'other' ) }
							>
								<TextControl
									className="sensei-setup-wizard__text-control"
									value={ other }
									placeholder={ __( 'Description' ) }
									onChange={ ( value ) =>
										setSitePurpose( ( formState ) => ( {
											...formState,
											other: value,
										} ) )
									}
								/>
							</PurposeItem>
						</ul>
						<div className="sensei-setup-wizard__actions sensei-setup-wizard__actions--full-width">
							<button disabled={ isEmpty } onClick={ submitPage } className="sensei-button">
								{ __( 'Continue' ) }
							</button>
						</div>
					</div>
				</>
			) }
		</SenseiStepContainer>
	);
};

export default SenseiPurpose;
