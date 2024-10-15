import clsx from 'clsx';
import cookie from 'cookie';
import React, { cloneElement, useCallback, useContext, useMemo, useState } from 'react';
import { SurveyContextType, SurveyActionsContextType, TriggerProps, SurveyProps } from './types';

export * from './types';

const SurveyContext = React.createContext< SurveyContextType | undefined >( undefined );

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
	as = 'span',
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
export const Survey = ( {
	children,
	name,
	onAccept,
	onSkip,
	isOpen = true,
	className,
}: SurveyProps ) => {
	const cookieValue = cookie.parse( document.cookie );
	const shouldShow = ! cookieValue[ name ];
	const [ shouldShowSurvey, setShouldShowSurvey ] = useState( isOpen && shouldShow );
	const element = bemElement( className );

	const handleClose = useCallback(
		( reason: 'skip' | 'accept' ) => {
			document.cookie = cookie.serialize( name, reason, {
				expires: new Date( Date.now() + 1000 * 60 * 60 * 24 * 365 ),
			} );

			if ( reason === 'accept' ) {
				onAccept?.();
			}

			if ( reason === 'skip' ) {
				onSkip?.();
			}

			setShouldShowSurvey( false );
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
		<div
			aria-modal="true"
			role="dialog"
			aria-label={ name }
			className={ clsx( 'survey-notice', className ) }
		>
			<button
				className={ clsx( 'survey-notice__backdrop', element( 'backdrop' ) ) }
				onClick={ () => actions.skip() }
			/>
			<div className={ clsx( 'survey-notice__popup', element( 'popup' ) ) }>
				<SurveyContext.Provider value={ { isOpen } }>
					<SurveyActionsContext.Provider value={ actions }>
						{ children }
					</SurveyActionsContext.Provider>
				</SurveyContext.Provider>
			</div>
		</div>
	);
};
