import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Card,
	CardBody,
	Icon,
} from '@wordpress/components';
import { info, published, error, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { caution } from './icons';
import type { NoticeVariant, NoticeProps } from './types';
import './style.scss';

const icons: { [ key in NoticeVariant ]: any } = {
	info,
	warning: caution,
	success: published,
	error,
};

function UnforwardedNotice(
	{
		variant = 'info',
		title,
		description,
		actions,
		density = 'low',
		isDismissible = true,
		onRemove,
	}: NoticeProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	const hasLowDensity = density === 'low';

	return (
		<Card
			className={ clsx( 'dashboard-notice', `is-${ variant }`, `has-density-${ density }` ) }
			ref={ ref }
		>
			<CardBody className="dashboard-notice__body">
				<HStack spacing={ hasLowDensity ? 2 : 1 } justify="flex-start" alignment="flex-start">
					<Icon className="dashboard-notice__icon" icon={ icons[ variant ] } />
					<VStack className="dashboard-notice__content" spacing={ 3 }>
						<VStack className="dashboard-notice__heading" spacing={ 1 }>
							<span className="dashboard-notice__title">{ title }</span>
							{ description && (
								<span className="dashboard-notice__description">{ description }</span>
							) }
						</VStack>
						{ actions && (
							<HStack className="dashboard-notice__actions" spacing={ 3 } justify="flex-start">
								{ actions }
							</HStack>
						) }
					</VStack>
					{ isDismissible && (
						<Button
							className="dashboard-notice__close-button"
							icon={ closeSmall }
							onClick={ onRemove }
						/>
					) }
				</HStack>
			</CardBody>
		</Card>
	);
}

export const Notice = forwardRef( UnforwardedNotice );

export default Notice;
