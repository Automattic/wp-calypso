import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { TextareaControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useAIAssembler from '../pattern-assembler/hooks/use-ai-assembler';
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

	const [ callAIAssembler, setPrompt, prompt, loading ] = useAIAssembler();

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		callAIAssembler()
			?.then( () => submit?.( { aiSitePrompt: prompt } ) )
			?.catch( () => goNext?.() );
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
								<StyledNextButton type="submit" disabled={ loading || prompt.length < 16 }>
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
					hideBack
					goNext={ goNext }
					isHorizontalLayout
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
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</div>
	);
};

export default AISitePrompt;
