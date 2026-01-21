import { userPreferencesMutation, rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import clsx from 'clsx';
import { useState } from 'react';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { AllSitesIllustration, PrimarySiteIllustration, ReaderIllustration } from './illustrations';

import './style.scss';

/** Valid landing page options for user preferences. */
type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

/** Configuration for a landing page option card. */
interface LandingPageOption {
	value: LandingPage;
	title: string;
	description: string;
	illustration: React.ReactNode;
}

/** Props for the LandingPageOptionCard component. */
interface LandingPageOptionCardProps {
	option: LandingPageOption;
	isSelected: boolean;
	isDisabled: boolean;
	onSelect: ( value: LandingPage ) => void;
}

/**
 * A selectable card displaying a landing page option with illustration.
 * Implements accessible radio button pattern with keyboard navigation.
 */
function LandingPageOptionCard( {
	option,
	isSelected,
	isDisabled,
	onSelect,
}: LandingPageOptionCardProps ) {
	const handleClick = () => {
		if ( ! isDisabled ) {
			onSelect( option.value );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			handleClick();
		}
	};

	return (
		<div
			className={ clsx( 'landing-page-option-card', {
				'is-selected': isSelected,
				'is-disabled': isDisabled,
			} ) }
			role="radio"
			aria-checked={ isSelected }
			aria-disabled={ isDisabled }
			tabIndex={ isDisabled ? -1 : 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
		>
			<div className="landing-page-option-card__illustration">
				{ option.illustration }
				<input
					className="landing-page-option-card__radio"
					type="radio"
					name="landing-page-option"
					value={ option.value }
					checked={ isSelected }
					disabled={ isDisabled }
					onChange={ () => onSelect( option.value ) }
					tabIndex={ -1 }
					aria-hidden="true"
				/>
			</div>
			<VStack className="landing-page-option-card__content" spacing={ 0 }>
				<Text className="landing-page-option-card__title" weight={ 500 }>
					{ option.title }
				</Text>
				<Text className="landing-page-option-card__description" variant="muted">
					{ option.description }
				</Text>
			</VStack>
		</div>
	);
}

/**
 * Preferences section for selecting the default landing page after login.
 * Displays visual card options for All Sites, Primary Site, or Reader.
 * Saves immediately on selection with optimistic UI updates.
 */
export default function PreferencesDefaultLanding() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: serverLandingPage } = useSuspenseQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ): LandingPage => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	// Optimistic state for immediate UI feedback
	const [ optimisticSelection, setOptimisticSelection ] = useState< LandingPage | null >( null );

	const { mutateAsync: saveUserPreferences, isPending: isSavingUserPreferences } = useMutation(
		userPreferencesMutation()
	);

	const options: LandingPageOption[] = [
		{
			value: 'sites',
			title: __( 'All Sites' ),
			description: __( 'See a list of all your sites.' ),
			illustration: <AllSitesIllustration />,
		},
		{
			value: 'primary-site-dashboard',
			title: __( 'Primary Site' ),
			description: __( 'Go to your main site.' ),
			illustration: <PrimarySiteIllustration />,
		},
		{
			value: 'reader',
			title: __( 'Reader' ),
			description: __( 'Posts you follow.' ),
			illustration: <ReaderIllustration />,
		},
	];

	const handleSelect = ( value: LandingPage ) => {
		// Optimistically update the UI immediately
		setOptimisticSelection( value );

		const updatedAt = Date.now();
		saveUserPreferences( {
			'sites-landing-page': {
				useSitesAsLandingPage: value === 'sites',
				updatedAt,
			},
			'reader-landing-page': {
				useReaderAsLandingPage: value === 'reader',
				updatedAt,
			},
		} )
			.then( () => {
				setOptimisticSelection( null );
				createSuccessNotice( __( 'Default landing page saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				// Revert optimistic update on error
				setOptimisticSelection( null );
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} );
	};

	// Use optimistic selection if available, otherwise use server value
	const currentSelection = optimisticSelection ?? serverLandingPage;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Default landing page' ) }
						description={ __( 'Choose what you see after logging into WordPress.com' ) }
					/>

					<HStack
						className="landing-page-options"
						spacing={ 0 }
						alignment="stretch"
						role="radiogroup"
						aria-label={ __( 'Default landing page' ) }
					>
						{ options.map( ( option ) => (
							<LandingPageOptionCard
								key={ option.value }
								option={ option }
								isSelected={ currentSelection === option.value }
								isDisabled={ isSavingUserPreferences }
								onSelect={ handleSelect }
							/>
						) ) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
