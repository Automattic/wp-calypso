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
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

import './style.scss';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

// Inline SVG illustrations - simple and abstract
const AllSitesIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Title */ }
		<rect x="16" y="16" width="40" height="10" rx="2" fill="#1E1E1E" />
		{ /* Site cards - 2x2 grid */ }
		<rect
			x="16"
			y="40"
			width="120"
			height="60"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<rect x="22" y="46" width="108" height="30" rx="3" fill="#DCDCDE" />
		<rect x="22" y="82" width="60" height="6" rx="1" fill="#1E1E1E" />
		<rect x="22" y="92" width="80" height="4" rx="1" fill="#C3C4C7" />

		<rect
			x="144"
			y="40"
			width="120"
			height="60"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<rect x="150" y="46" width="108" height="30" rx="3" fill="#DCDCDE" />
		<rect x="150" y="82" width="50" height="6" rx="1" fill="#1E1E1E" />
		<rect x="150" y="92" width="70" height="4" rx="1" fill="#C3C4C7" />

		<rect
			x="16"
			y="108"
			width="120"
			height="60"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<rect x="22" y="114" width="108" height="30" rx="3" fill="#DCDCDE" />
		<rect x="22" y="150" width="70" height="6" rx="1" fill="#1E1E1E" />
		<rect x="22" y="160" width="90" height="4" rx="1" fill="#C3C4C7" />

		<rect
			x="144"
			y="108"
			width="120"
			height="60"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<rect x="150" y="114" width="108" height="30" rx="3" fill="#DCDCDE" />
		<rect x="150" y="150" width="55" height="6" rx="1" fill="#1E1E1E" />
		<rect x="150" y="160" width="75" height="4" rx="1" fill="#C3C4C7" />
	</svg>
);

const PrimarySiteIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Title */ }
		<rect x="16" y="16" width="80" height="12" rx="2" fill="#1E1E1E" />
		<rect x="16" y="32" width="120" height="4" rx="1" fill="#C3C4C7" />
		{ /* Site preview */ }
		<rect x="16" y="48" width="80" height="120" rx="6" fill="#1E1E1E" />
		<rect x="24" y="64" width="64" height="8" rx="1" fill="white" opacity="0.9" />
		<rect x="24" y="78" width="48" height="4" rx="1" fill="white" opacity="0.5" />
		<rect x="24" y="100" width="28" height="12" rx="3" fill="white" opacity="0.3" />
		{ /* Status cards - 2x2 grid */ }
		<rect
			x="108"
			y="48"
			width="76"
			height="54"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="124" cy="68" r="8" fill="#DCDCDE" />
		<rect x="116" y="86" width="50" height="6" rx="1" fill="#1E1E1E" />

		<rect
			x="192"
			y="48"
			width="76"
			height="54"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="208" cy="68" r="8" fill="#DCDCDE" />
		<rect x="200" y="86" width="50" height="6" rx="1" fill="#1E1E1E" />

		<rect
			x="108"
			y="110"
			width="76"
			height="54"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="124" cy="130" r="8" fill="#DCDCDE" />
		<rect x="116" y="148" width="50" height="6" rx="1" fill="#1E1E1E" />

		<rect
			x="192"
			y="110"
			width="76"
			height="54"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="208" cy="130" r="8" fill="#DCDCDE" />
		<rect x="200" y="148" width="50" height="6" rx="1" fill="#1E1E1E" />
	</svg>
);

const ReaderIllustration = () => (
	<svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="280" height="180" rx="8" fill="#F6F7F7" />
		{ /* Sidebar */ }
		<rect x="0" y="0" width="56" height="180" fill="white" />
		<rect x="8" y="16" width="40" height="10" rx="2" fill="#1E1E1E" />
		<rect x="8" y="36" width="36" height="6" rx="1" fill="#C3C4C7" />
		<rect x="8" y="48" width="28" height="6" rx="1" fill="#C3C4C7" />
		<rect x="8" y="60" width="32" height="6" rx="1" fill="#C3C4C7" />
		<rect x="8" y="72" width="24" height="6" rx="1" fill="#C3C4C7" />
		{ /* Main content */ }
		<rect x="68" y="16" width="50" height="10" rx="2" fill="#1E1E1E" />
		<rect x="68" y="32" width="80" height="4" rx="1" fill="#C3C4C7" />
		{ /* Post card 1 */ }
		<rect
			x="68"
			y="48"
			width="200"
			height="56"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="88" cy="76" r="12" fill="#DCDCDE" />
		<rect x="108" y="64" width="60" height="6" rx="1" fill="#1E1E1E" />
		<rect x="108" y="76" width="140" height="8" rx="1" fill="#1E1E1E" />
		<rect x="108" y="90" width="120" height="4" rx="1" fill="#C3C4C7" />
		{ /* Post card 2 */ }
		<rect
			x="68"
			y="112"
			width="200"
			height="56"
			rx="6"
			fill="white"
			stroke="#DCDCDE"
			strokeWidth="1"
		/>
		<circle cx="88" cy="140" r="12" fill="#DCDCDE" />
		<rect x="108" y="128" width="50" height="6" rx="1" fill="#1E1E1E" />
		<rect x="108" y="140" width="130" height="8" rx="1" fill="#1E1E1E" />
		<rect x="108" y="154" width="100" height="4" rx="1" fill="#C3C4C7" />
	</svg>
);

interface LandingPageOption {
	value: LandingPage;
	title: string;
	description: string;
	illustration: React.ReactNode;
}

interface LandingPageOptionCardProps {
	option: LandingPageOption;
	isSelected: boolean;
	isDisabled: boolean;
	onSelect: ( value: LandingPage ) => void;
}

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
					aria-label={ option.title }
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

export default function PreferencesDefaultLanding() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: defaultLandingPage } = useSuspenseQuery( {
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
			description: __( 'View posts from sites you follow.' ),
			illustration: <ReaderIllustration />,
		},
	];

	const handleSelect = ( value: LandingPage ) => {
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
				createSuccessNotice( __( 'Default landing page saved.' ), {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( __( 'Failed to save default landing page.' ), {
					type: 'snackbar',
				} );
			} );
	};

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
								isSelected={ defaultLandingPage === option.value }
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
