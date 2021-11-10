import { Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import type { GoToStep } from '../../types';
import type { ReactElement } from 'react';

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
				</div>
			</div>
			<div className="woocommerce-install__content">
				<div>
					<LoadingEllipsis />
				</div>
			</div>
		</>
	);
}
