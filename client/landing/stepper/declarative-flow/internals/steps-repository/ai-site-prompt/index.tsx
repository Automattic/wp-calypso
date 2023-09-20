import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { TextareaControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
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

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setLoading( true );
		wpcomRequest( {
			path: '/pattern-assembler/ai/v1/generate',
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {
				description: prompt,
			},
		} )
			.then( ( response ) => {
				console.log( 'AI response', response ); /* eslint-disable-line no-console */
				setLoading( false );
			} )
			.catch( ( error ) => {
				console.error( 'big sky error', error ); /* eslint-disable-line no-console */
				setLoading( false );
			} );
		//submit?.();
	};

	function getContent() {
		return (
			<>
				<div className="business-info__instructions-container">
					<form onSubmit={ onSubmit }>
						<TextareaControl
							label={ __( 'Please describe your site, business and ideas in detail.' ) }
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
		<div className="business-info__signup is-woocommerce-install">
			<div className="business-info__is-store-address">
				<StepContainer
					stepName="business-info"
					className={ `is-step-${ intent }` }
					skipButtonAlign="top"
					goBack={ goBack }
					goNext={ goNext }
					isHorizontalLayout={ true }
					formattedHeader={
						<FormattedHeader
							id="business-info-header"
							headerText={ __( 'Tell us a bit about the site you want.' ) }
							subHeaderText={ __( 'And let WordPress do Wonders.' ) }
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
