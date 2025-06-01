import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import cookie from 'cookie';
import React, { cloneElement, useCallback, useContext, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { type SurveyActionsContextType, type TriggerProps, type SurveyProps } from './types';
export * from './types';
import './style.scss';

export const SurveyActionsContext = React.createContext< SurveyActionsContextType >( {
	accept: () => {},
	skip: () => {},
} );

const Trigger = ( { asChild, children, onClick, as }: TriggerProps ) => {
	if ( asChild ) {
		return cloneElement( children, { onClick } );
	}
	const Tag = as ?? 'button';
	return <Tag onClick={ onClick }>{ children }</Tag>;
};

export const SurveyTriggerAccept = ( {
	children,
	as = 'button',
	asChild,
}: Omit< TriggerProps, 'onClick' > ) => {
	const { accept } = useContext( SurveyActionsContext );
	return (
		<Trigger as={ as } onClick={ accept } asChild={ asChild }>
			{ children }
		</Trigger>
	);
};

export const SurveyTriggerSkip = ( {
	children,
	as = 'span',
	asChild,
}: Omit< TriggerProps, 'onClick' > ) => {
	const { skip } = useContext( SurveyActionsContext );
	return (
		<Trigger as={ as } onClick={ skip } asChild={ asChild }>
			{ children }
		</Trigger>
	);
};

const bemElement =
	( customClassName?: string ) =>
	( element: string ): string | undefined => {
		if ( customClassName ) {
			return `${ customClassName }__${ element }`;
		}

		return undefined;
	};

const ONE_YEAR_IN_SECONDS = 1000 * 60 * 60 * 24 * 365;
const ONE_DAY_IN_SECONDS = 1000 * 60 * 60 * 24;
/**
 * Generic Survey component
 * @example
 * ```tsx
 * <Survey name="survey-name">
 * 	<div>
 * 		<h1>Survey</h1>
 * 		<img src="https://wordpress.org/about/assets/images/wp-logo.png" alt="WordPress" />
 * 		<SurveyTriggerAccept>
 * 			<Button>Take the survey</Button>
 * 		</SurveyTriggerAccept>
 * 		<SurveyTriggerSkip>
 * 			<Button>Skip the survey</Button>
 * 		</SurveyTriggerSkip>
 * 	</div>
 * </Survey>
 * ```
 */
export const Survey = ( { children, name, onAccept, onSkip, title, className }: SurveyProps ) => {
	const cookieValue = cookie.parse( document.cookie );
	const shouldShow = ! cookieValue[ name ];
	const [ shouldShowSurvey, setShouldShowSurvey ] = useState( shouldShow );
	const element = bemElement( className );
	const handleClose = useCallback(
		( reason: 'skip' | 'accept' | 'skip_backdrop' ) => {
			const PERIOD = reason === 'skip_backdrop' ? ONE_DAY_IN_SECONDS : ONE_YEAR_IN_SECONDS;

			document.cookie = cookie.serialize( name, reason, {
				expires: new Date( Date.now() + PERIOD ),
			} );

			if ( reason === 'accept' ) {
				recordTracksEvent( 'calypso_survey_accepted', { survey: name, action: reason } );
				onAccept?.();
			}

			if ( reason === 'skip' ) {
				recordTracksEvent( 'calypso_survey_skipped', { survey: name, action: reason } );
				onSkip?.();
			}

			if ( document.startViewTransition ) {
				document.startViewTransition( async () => {
					//use flushSync to ensure the DOM is updated before the view transition starts
					//it is essential to use view transition api
					flushSync( () => {
						setShouldShowSurvey( false );
					} );
				} );
			} else {
				setShouldShowSurvey( false );
			}
		},
		[ name, onAccept, onSkip ]
	);

	const actions = useMemo(
		() => ( {
			accept: () => handleClose( 'accept' ),
			skip: () => handleClose( 'skip' ),
		} ),
		[ handleClose ]
	);

	if ( ! shouldShowSurvey ) {
		return null;
	}

	return (
		<SurveyActionsContext.Provider value={ actions }>
			<div aria-label={ name } className={ clsx( 'survey-notice', className ) }>
				<SurveyTriggerSkip asChild>
					<button className={ clsx( 'survey-notice__backdrop', element( 'backdrop' ) ) } />
				</SurveyTriggerSkip>
				<div className={ clsx( 'survey-notice__popup', element( 'popup' ) ) }>
					<div className={ clsx( 'survey-notice__popup-head', element( 'popup-head' ) ) }>
						<div
							className={ clsx( 'survey-notice__popup-head-title', element( 'popup-head-title' ) ) }
						>
							{ title }
						</div>
						<SurveyTriggerSkip asChild>
							<Button
								className={ clsx(
									'survey-notice__popup-head-close',
									element( 'popup-head-close' )
								) }
							>
								<Gridicon icon="cross" size={ 16 } />
							</Button>
						</SurveyTriggerSkip>
					</div>

					<div>{ children }</div>
				</div>
			</div>
		</SurveyActionsContext.Provider>
	);
};
