import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import {
	cloneElement,
	MouseEvent,
	ReactElement,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react';
import GitHubIcon from 'calypso/components/social-icons/github';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { isFormDisabled as isFormDisabledSelector } from 'calypso/state/login/selectors';
import './style.scss';

type GithubLoginButtonProps = {
	children?: ReactNode;
};

const GitHubLoginButton = ( { children }: GithubLoginButtonProps ) => {
	const translate = useTranslate();

	const isFormDisabled = useSelector( isFormDisabledSelector );

	const [ disabledState ] = useState< boolean >( false );
	const [ errorState ] = useState< string | null >( null );
	const [ showError, setShowError ] = useState< boolean >( false );

	const errorRef = useRef< EventTarget | null >( null );

	useEffect( () => {
		// This feature is already gated inside client/blocks/authentication/social/index.tsx
		// Adding an extra check here to prevent accidental inclusions in other parts of the app
		if ( ! config.isEnabled( 'login/github' ) ) {
			return;
		}
	} );

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		errorRef.current = e.currentTarget;
	};

	const isDisabled = Boolean( disabledState || isFormDisabled || errorState );

	const eventHandlers = {
		onClick: handleClick,
		onMouseEnter: () => setShowError( true ),
		onMouseLeave: () => setShowError( false ),
	};

	let customButton = null;
	if ( children ) {
		const childProps = {
			className: classNames( { disabled: isDisabled } ),
			...eventHandlers,
		};

		customButton = cloneElement( children as ReactElement, childProps );
	}

	return (
		<>
			{ customButton ? (
				customButton
			) : (
				<button
					className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
					{ ...eventHandlers }
				>
					<GitHubIcon isDisabled={ isDisabled } />

					<span className="social-buttons__service-name">
						{ translate( 'Continue with %(service)s', {
							args: { service: 'GitHub' },
							comment:
								'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
						} ) }
					</span>
				</button>
			) }
			<Popover
				id="social-buttons__error"
				className="social-buttons__error"
				isVisible={ showError }
				onClose={ () => setShowError( false ) }
				position="top"
				context={ errorRef.current }
			>
				{ preventWidows( errorState ) }
			</Popover>
		</>
	);
};

export default GitHubLoginButton;
