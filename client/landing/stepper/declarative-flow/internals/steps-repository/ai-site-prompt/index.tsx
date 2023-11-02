import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { TextareaControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import wpcomRequest from 'wpcom-proxy-request';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const AISitePrompt: Step = function ( props ) {
	const { goNext, goBack, submit } = props.navigation; // eslint-disable-line @typescript-eslint/no-unused-vars

	const { __ } = useI18n();
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const [ loading, setLoading ] = useState( false );
	const [ prompt, setPrompt ] = useState( '' );

	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);
	const [ searchParams, setSearchParams ] = useSearchParams(); // eslint-disable-line @typescript-eslint/no-unused-vars

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setLoading( true );
		wpcomRequest( {
			path: '/pattern-assembler/ai/v3/generate',
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {
				description: prompt,
			},
		} )
			.then( ( response: any ) => {
				console.log( 'Patterns AI response', response ); /* eslint-disable-line no-console */
				// This actually passes the patterns to the pattern assembler.
				setSearchParams(
					( currentSearchParams ) => {
						currentSearchParams.set( 'header_pattern_id', response.header_pattern );
						currentSearchParams.set( 'footer_pattern_id', response.footer_pattern );
						currentSearchParams.set( 'pattern_ids', response.pages[ 0 ].patterns.join( ',' ) );
						return currentSearchParams;
					},
					{ replace: true }
				);
				setLoading( false );
				submit?.();
			} )
			.catch( ( error ) => {
				console.error( 'big sky error', error ); /* eslint-disable-line no-console */
				setLoading( false );
				submit?.();
			} );
	};

	function getContent() {
		return (
			<>
				<div className="site-prompt__instructions-container">
					<form onSubmit={ onSubmit }>
						<TextareaControl
							help={ __( 'Sharing more detail here will help AI understand your intent better.' ) }
							value={ prompt }
							onChange={ ( value ) => setPrompt( value ) }
							disabled={ loading }
						/>

						<ActionSection>
							{ loading && <LoadingEllipsis /> }
							{ ! loading && (
								<StyledNextButton type="submit" disabled={ loading }>
									{ __( 'Continue' ) }
								</StyledNextButton>
							) }
						</ActionSection>
					</form>
				</div>
			</>
		);
	}

	return (
		<div className="site-prompt__signup is-woocommerce-install">
			<div className="site-prompt__is-store-address">
				<StepContainer
					stepName="site-prompt"
					className={ `is-step-${ intent }` }
					skipButtonAlign="top"
					goBack={ goBack }
					goNext={ goNext }
					isHorizontalLayout={ true }
					formattedHeader={
						<FormattedHeader
							id="site-prompt-header"
							headerText={ __( 'Tell us a bit about your web site or business.' ) }
							subHeaderText={ __(
								'We will create a home page template for you based on best practices for sites like yours.'
							) }
							align="left"
						/>
					}
					stepContent={ getContent() }
					stepProgress={ stepProgress }
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</div>
	);
};

export default AISitePrompt;
