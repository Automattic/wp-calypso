import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { GoToStep } from '../../types';

interface Props {
	goToStep: GoToStep;
}

export default function Install( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();

	return (
		<>
			<div className="woocommerce-install__heading-wrapper">
				<div className="woocommerce-install__heading">
					<Title>{ __( 'Installing WooCommerce…' ) }</Title>
					<SubTitle></SubTitle>

					<div className="woocommerce-install__buttons-group">
						<div>
							<BackButton onClick={ () => goToStep( 'confirm' ) } />
						</div>
					</div>
				</div>
			</div>
			<div className="woocommerce-install__content">
				<div>
					<NextButton onClick={ () => goToStep( 'complete' ) }>{ __( 'Next' ) }</NextButton>
				</div>
			</div>
		</>
	);
}
