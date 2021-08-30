import {
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackPlanSlug,
	isJetpackProductSlug,
} from '@automattic/calypso-products';
import { SelectControl, TextareaControl, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import getSiteImportEngine from 'calypso/state/selectors/get-site-import-engine';

import './style.scss';

const shuffleArray = ( array ) => {
	const arrayToShuffle = array.slice( 0 );
	// Durstenfeld algorithm https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
	for ( let i = arrayToShuffle.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ arrayToShuffle[ i ], arrayToShuffle[ j ] ] = [ arrayToShuffle[ j ], arrayToShuffle[ i ] ];
	}

	return arrayToShuffle;
};

const getCancellationReasonOptions = ( purchase ) => {
	let options = [];
	if ( isJetpackPlan( purchase ) ) {
		options = [
			'couldNotActivate',
			'didNotInclude',
			'downgradeToAnotherPlan',
			'onlyNeedFree',
		].concat( options );
	} else if ( isDomainTransfer( purchase ) ) {
		options = [
			'noLongerWantToTransfer',
			'couldNotCompleteTransfer',
			'useDomainWithoutTransferring',
		].concat( options );
	} else {
		options = [ 'couldNotInstall', 'tooHard', 'didNotInclude', 'onlyNeedFree' ].concat( options );
	}

	options = shuffleArray( options );
	options.unshift( '' ); // Placeholder.
	options.push( 'anotherReasonOne' );
	return options;
};

const getImportOptions = () => {
	return [ '', 'happy', 'look', 'content', 'functionality' ];
};

const getNextAdventureOptions = ( purchase ) => {
	let options = [];
	if ( isJetpackPlan( purchase ) ) {
		options = [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ].concat( options );
	} else if ( ! isDomainTransfer( purchase ) ) {
		options = [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ].concat( options );
	}

	if ( options.length ) {
		options = shuffleArray( options );
		options.unshift( '' ); // Placeholder.
		options.push( 'anotherReasonTwo' );
	}

	return options;
};

const getCancellationReasonLabel = ( option ) => {
	switch ( option ) {
		case 'couldNotInstall':
			return __( "I couldn't install a plugin/theme I wanted." );
		case 'tooHard':
			return __( 'It was too hard to set up my site.' );
		case 'didNotInclude':
			return __( "This upgrade didn't include what I needed." );
		case 'downgradeToAnotherPlan':
			return __( "I'd like to downgrade to another plan." );
		case 'onlyNeedFree':
			return __( 'The plan was too expensive.' );
		case 'couldNotActivate':
			return __( 'I was unable to activate or use the product.' );
		case 'noLongerWantToTransfer':
			return __( 'I no longer want to transfer my domain.' );
		case 'couldNotCompleteTransfer':
			return __( 'Something went wrong and I could not complete the transfer.' );
		case 'useDomainWithoutTransferring':
			return __( 'I’m going to use my domain with WordPress.com without transferring it.' );
		case 'anotherReasonOne':
			return __( 'Another reason…' );
		case '':
			return __( 'Select your reason' );
		default:
			return null;
	}
};

const getNextAdventureLabel = ( option ) => {
	switch ( option ) {
		case 'stayingHere':
			return __( "I'm staying here and using the free plan." );
		case 'otherWordPress':
			return __( "I'm going to use WordPress somewhere else." );
		case 'differentService':
			return __( "I'm going to use a different service for my website or blog." );
		case 'noNeed':
			return __( 'I no longer need a website or blog.' );
		case 'otherPlugin':
			return __( 'I found a better plugin or service.' );
		case 'leavingWP':
			return __( "I'm moving my site off of WordPress." );
		case 'anotherReasonTwo':
			return __( 'Another answer…' );
		case '':
			return __( 'Select an answer' );
		default:
			return null;
	}
};

const getImportLabel = ( option ) => {
	switch ( option ) {
		case 'happy':
			return __( 'I was happy.' );
		case 'look':
			return __(
				'Most of my content was imported, but it was too hard to get things looking right.'
			);
		case 'content':
			return __( 'Not enough of my content was imported.' );
		case 'functionality':
			return __( "I didn't have the functionality I have on my existing site." );
		case '':
			return __( 'Select an answer' );
		default:
			return null;
	}
};

const getCancellationReasonTextPlaceholder = ( option ) => {
	switch ( option ) {
		case 'couldNotInstall':
			return __( 'What plugin/theme were you trying to install?' );
		case 'tooHard':
			return __( 'Where did you run into problems?' );
		case 'didNotInclude':
			return __( 'What are we missing that you need?' );
		case 'downgradeToAnotherPlan':
			return __( 'Mind telling us which one?' );
		case 'onlyNeedFree':
			return __( 'How can we improve our upgrades?' );
		case 'couldNotActivate':
			return __( 'Where did you run into problems?' );
		case 'anotherReasonOne':
			return '';
		default:
			return null;
	}
};

const getNextAdventureTextPlaceholder = ( option ) => {
	switch ( option ) {
		case 'otherWordPress':
			return __( 'Mind telling us where?' );
		case 'differentService':
			return __( 'Mind telling us which one?' );
		case 'noNeed':
			return __( 'What will you do instead?' );
		case 'otherPlugin':
			return __( 'Mind telling us which one(s)?' );
		case 'leavingWP':
			return __( 'Any particular reason(s)?' );
		case 'anotherReasonTwo':
			return '';
		default:
			return null;
	}
};

export const submitFeedback = ( {
	cancellationReason,
	cancellationReasonText,
	importSatisfaction,
	nextAdventure,
	nextAdventureText,
	oneBetterThing,
	purchase,
} ) => {
	if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
		return;
	}

	const getSurveyDataType = () => {
		switch ( this.props.flowType ) {
			case CANCEL_FLOW_TYPE.REMOVE:
				return 'remove';
			case CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND:
				return 'refund';
			case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW:
				return 'cancel-autorenew';
			default:
				// Although we shouldn't allow it to reach here, we still include this default in case we forgot to add proper mappings.
				return 'general';
		}
	};

	const data = {
		'why-cancel': {
			response: cancellationReason,
			text: cancellationReasonText,
		},
		'next-adventure': {
			response: nextAdventure,
			text: nextAdventureText,
		},
		'what-better': { text: oneBetterThing },
		'import-satisfaction': { response: importSatisfaction },
		type: getSurveyDataType(),
	};

	submitSurvey( 'calypso-remove-purchase', purchase.siteId, enrichedSurveyData( data, purchase ) );
};

export const Feedback = ( { purchase, onValidate, trackEvent } ) => {
	const [ cancellationReason, setCancellationReason ] = useState( '' );
	const [ importSatisfaction, setImportSatisfaction ] = useState( '' );
	const [ nextAdventure, setNextAdventure ] = useState( '' );
	const [ cancellationReasonText, setCancellationReasonText ] = useState( '' );
	const [ nextAdventureText, setNextAdventureText ] = useState( '' );
	const [ oneBetterThing, setOneBetterThing ] = useState( '' );

	const cancellationReasonOptions = getCancellationReasonOptions( purchase );
	const importOptions = getImportOptions();
	const nextAdventureOptions = getNextAdventureOptions( purchase );
	const cancellationReasonTextPlaceholder = getCancellationReasonTextPlaceholder(
		cancellationReason
	);
	const nextAdventureTextPlaceholder = getNextAdventureTextPlaceholder( nextAdventure );

	useEffect( () => {
		if (
			cancellationReasonOptions.length &&
			( ! cancellationReason ||
				( cancellationReason === 'anotherReasonOne' && ! cancellationReasonText ) )
		) {
			return onValidate( false );
		}

		if (
			nextAdventureOptions.length &&
			( ! nextAdventure || ( nextAdventure === 'anotherReasonTwo' && ! nextAdventureText ) )
		) {
			return onValidate( false );
		}

		return onValidate( {
			cancellationReason,
			cancellationReasonText,
			importSatisfaction,
			nextAdventure,
			nextAdventureText,
			oneBetterThing,
		} );
	}, [
		cancellationReason,
		cancellationReasonOptions,
		cancellationReasonText,
		importSatisfaction,
		nextAdventure,
		nextAdventureOptions,
		nextAdventureText,
		oneBetterThing,
		onValidate,
	] );

	const isImport = !! useSelector( ( state ) => getSiteImportEngine( state, purchase?.siteId ) );

	if ( ! purchase ) {
		return null;
	}

	const isJetpack =
		isJetpackProductSlug( purchase.productSlug ) || isJetpackPlanSlug( purchase.productSlug );
	const productName = isJetpack ? __( 'Jetpack' ) : __( 'WordPress.com' );

	return (
		<div className="feedback">
			<FormattedHeader
				brandFont
				headerText={ __( 'Your thoughts are needed' ) }
				subHeaderText={ sprintf(
					'Before you go, please answer a few quick questions to help us improve %(productName)s.',
					{
						productName,
					}
				) }
			/>
			<div className="feedback__form">
				{ cancellationReasonOptions.length && (
					<div className="feedback__question">
						<SelectControl
							label={ __( 'Why are you canceling?' ) }
							value={ cancellationReason }
							options={ cancellationReasonOptions.map( ( option ) => ( {
								label: getCancellationReasonLabel( option ),
								value: option,
								disabled: ! option,
							} ) ) }
							onChange={ ( newReason ) => {
								setCancellationReason( newReason );
								setCancellationReasonText( '' );
								trackEvent( 'calypso_purchases_cancel_form_select_radio_option', {
									option: 'radio_1',
									value: newReason,
								} );
							} }
						/>
						{ cancellationReasonTextPlaceholder !== null && (
							<TextControl
								placeholder={ cancellationReasonTextPlaceholder }
								value={ cancellationReasonText }
								onChange={ ( newCancellationReasonText ) =>
									setCancellationReasonText( newCancellationReasonText )
								}
							/>
						) }
					</div>
				) }
				{ isImport && importOptions.length && (
					<div className="feedback__question">
						<SelectControl
							label={ __( 'You imported from another site. How did the import go?' ) }
							value={ importSatisfaction }
							options={ importOptions.map( ( option ) => ( {
								label: getImportLabel( option ),
								value: option,
								disabled: ! option,
							} ) ) }
							onChange={ ( newImportSatisfaction ) => {
								setImportSatisfaction( newImportSatisfaction );
								setCancellationReasonText( '' );
								trackEvent( 'calypso_purchases_cancel_form_select_radio_option', {
									option: 'import_radio',
									value: newImportSatisfaction,
								} );
							} }
						/>
					</div>
				) }
				{ nextAdventureOptions.length && (
					<div className="feedback__question">
						<SelectControl
							label={ __( 'Where is your next adventure taking you?' ) }
							value={ nextAdventure }
							options={ nextAdventureOptions.map( ( option ) => ( {
								label: getNextAdventureLabel( option ),
								value: option,
								disabled: ! option,
							} ) ) }
							onChange={ ( newNextAdventure ) => {
								setNextAdventure( newNextAdventure );
								setNextAdventureText( '' );
								trackEvent( 'calypso_purchases_cancel_form_select_radio_option', {
									option: 'radio_2',
									value: newNextAdventure,
								} );
							} }
						/>
						{ nextAdventureTextPlaceholder !== null && (
							<TextControl
								placeholder={ nextAdventureTextPlaceholder }
								value={ nextAdventureText }
								onChange={ ( newNextAdventureText ) =>
									setNextAdventureText( newNextAdventureText )
								}
							/>
						) }
					</div>
				) }
				{ cancellationReason && nextAdventure && ( ! isImport || importSatisfaction ) && (
					<div className="feedback__question">
						<TextareaControl
							label={ __( "What's one thing we could have done better?" ) }
							value={ oneBetterThing }
							onChange={ ( newOneBetterThing ) => setOneBetterThing( newOneBetterThing ) }
							placeholder={ __( 'Optional' ) }
						/>
					</div>
				) }
			</div>
		</div>
	);
};
