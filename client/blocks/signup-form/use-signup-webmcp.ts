import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';
import type { WebMcpToolRegistry } from '@automattic/webmcp';
import type { SignupAllowedService } from 'calypso/components/social-buttons/utils';

type SignupWebMcpOptions = {
	screen: 'options' | 'email' | 'email-edit';
	emailFormVisible: boolean;
	allowedSocialServices?: SignupAllowedService[];
	loginUrl?: string;
	openEmail: () => void;
	openLogin: () => void;
};

export function useSignupWebMcp( options: SignupWebMcpOptions ) {
	const optionsRef = useRef( options );
	useEffect( () => {
		optionsRef.current = options;
	}, [ options ] );

	const { screen, loginUrl } = options;
	useEffect( () => {
		const controller = new AbortController();
		let registry: WebMcpToolRegistry | undefined;
		const reportError = ( error: unknown ) => {
			// eslint-disable-next-line no-console
			console.warn( '[WebMCP] Signup integration failed:', error );
		};
		const result = ( value: unknown ) => ( {
			content: [ { type: 'text', text: JSON.stringify( value ) } ],
		} );
		const inputSchema = { type: 'object', properties: {}, additionalProperties: false };

		import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( ( { getWebMcpModelContext, createWebMcpToolRegistry } ) => {
				if ( controller.signal.aborted ) {
					return;
				}
				const modelContext = getWebMcpModelContext();
				if ( ! modelContext ) {
					return;
				}
				registry = createWebMcpToolRegistry( {
					modelContext,
					getTools: () =>
						screen === 'email-edit'
							? []
							: [
									{
										name: 'wpcom_get_auth_options',
										title: 'Get account options',
										description:
											'Read the signup methods and login availability on this account screen. Does not read credentials or submit a form.',
										inputSchema,
										annotations: { readOnlyHint: true, consequentialHint: false },
										execute: () => {
											const current = optionsRef.current;
											const socialServices = current.allowedSocialServices ?? [
												'google',
												'apple',
												'github',
												'paypal',
											];
											return result( {
												screen: current.screen,
												emailFormVisible: current.emailFormVisible,
												signupMethods:
													current.screen === 'email'
														? [ 'email' ]
														: [
																...socialServices.filter(
																	( service ) =>
																		[ 'google', 'apple', 'github' ].includes( service ) ||
																		( service === 'paypal' &&
																			config.isEnabled( 'sign-in-with-paypal' ) )
																),
																'email',
															],
												loginAvailable: Boolean( current.loginUrl ),
												nextAction: 'Choose a signup method or open login for an existing account.',
											} );
										},
									},
									{
										name: 'wpcom_open_email_signup',
										title: 'Open email signup',
										description:
											'Show the email signup form. Then use wpcom_register_account to submit it after the account owner agrees to the terms shown on screen.',
										inputSchema,
										annotations: { readOnlyHint: false, consequentialHint: false },
										execute: () => {
											optionsRef.current.openEmail();
											return result( {
												emailFormVisible: true,
												nextAction:
													'Use wpcom_register_account after the account owner agrees to the terms.',
											} );
										},
									},
									...( loginUrl
										? [
												{
													name: 'wpcom_open_login',
													title: 'Open login',
													description:
														'Open the existing login link, preserving the onboarding return destination and Playground site. Authentication continues on the login screen.',
													inputSchema,
													annotations: { readOnlyHint: false, consequentialHint: false },
													execute: () => {
														optionsRef.current.openLogin();
														return result( {
															nextAction: 'Choose a login method on the login screen.',
														} );
													},
												},
											]
										: [] ),
								],
				} );
				void registry.sync().catch( reportError );
			} )
			.catch( reportError );

		return () => {
			controller.abort();
			registry?.dispose();
		};
	}, [ screen, loginUrl ] );
}
