import { SenseiStepContainer } from '@automattic/onboarding';
import { TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import React, { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { SenseiStepProgress } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/sensei-setup/sensei-step-progress';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PurposeItem from './purpose-item';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

export const purposes = [
	{
		id: 'sell_courses',
		label: __( 'Sell courses and generate income' ),
		plugin: { slug: 'woocommerce', id: 'woocommerce/woocommerce' },
		//description: __( 'WooCommerce will be installed for free.' ),
	},
	{
		id: 'provide_certification',
		label: __( 'Provide certification' ),
		plugin: {
			slug: 'sensei-certificates',
			id: 'sensei-certificates/woothemes-sensei-certificates',
		},
		//description: __( 'Sensei LMS Certificates will be installed for free.' ),
	},
	{
		id: 'educate_students',
		label: __( 'Educate students' ),
	},
	{
		id: 'train_employees',
		label: __( 'Train employees' ),
	},
];

type FormState = {
	selected: string[];
	other: string;
};

const SenseiPurpose: Step = ( { navigation: { goToStep } } ) => {
	const [ progress, setProgress ] = useState< number >( 0 );

	// Stall for a few seconds while the atomic transfer is going on.
	useEffect( () => {
		const tick = async () => {
			if ( progress < 110 ) {
				await wait( 500 );
				setProgress( ( progress ) => progress + 10 );
			}
		};
		tick();
	}, [ progress ] );

	const waiting = progress < 110;

	const [ { selected, other }, setFormState ] = useState< FormState >( {
		selected: [],
		other: '',
	} );

	const isEmpty = ! selected.length;

	const toggleItem = ( id: string ) => {
		setFormState( ( formState ) => ( {
			...formState,
			selected: selected.includes( id )
				? selected.filter( ( item ) => item !== id )
				: [ id, ...selected ],
		} ) );
	};

	const submitPage = async () => {
		// TODO Save user selection.

		goToStep?.( 'senseiLaunch' );
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
							{ purposes.map( ( { id, label, description } ) => (
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
										setFormState( ( formState ) => ( {
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
