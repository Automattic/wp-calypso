import { JetpackLogo } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { Stack } from '@wordpress/ui';
import clsx from 'clsx';
import AutomatticBylineLogo from '../automattic-byline-logo';
import './style.scss';
import type { FC } from 'react';

export interface JetpackFooterMenuItem {
	label: string;
	title?: string;
	href?: string;
	role?: string;
	onClick?: () => void;
	onKeyDown?: () => void;
}

interface JetpackFooterProps {
	className?: string;
	menu?: JetpackFooterMenuItem[];
	/** Product name shown next to the logo. Defaults to 'Jetpack'. */
	name?: string;
	/** Whether to show the Jetpack logo next to the name. Defaults to true. */
	showLogo?: boolean;
}

/**
 * JetpackFooter component displays a tiny Jetpack logo with the product name on the left and the Automattic Airline "by line" on the right.
 */
const JetpackFooter: FC< JetpackFooterProps > = ( { className, menu, name, showLogo = true } ) => {
	return (
		<Stack
			render={ <footer /> }
			className={ clsx( 'jetpack-footer', className ) }
			aria-label={ name ?? __( 'Jetpack', 'jetpack-components' ) }
			role="contentinfo"
			direction="row"
			justify="flex-start"
			align="center"
			wrap="wrap"
			gap="xl"
		>
			<Stack className="jetpack-footer__logo" direction="row" gap="sm" align="center">
				{ showLogo && <JetpackLogo size={ 16 } aria-hidden="true" /> }
				<span className="jetpack-footer__logo-text">{ name ?? 'Jetpack' }</span>
			</Stack>
			{ menu && menu.length > 0 && (
				<Stack render={ <ul /> } direction="row" gap="lg" wrap="wrap">
					{ menu.map( ( item ) => {
						const isButton = item.role === 'button';

						return (
							<li key={ item.label }>
								{ isButton ? (
									<span
										className="jetpack-footer__menu-item"
										role="button"
										tabIndex={ 0 }
										onClick={ item.onClick }
										onKeyDown={ item.onKeyDown }
									>
										{ item.label }
									</span>
								) : (
									<a
										className="jetpack-footer__menu-item"
										href={ item.href }
										title={ item.title }
										onClick={ item.onClick }
										onKeyDown={ item.onKeyDown }
									>
										{ item.label }
									</a>
								) }
							</li>
						);
					} ) }
				</Stack>
			) }
			<a
				className="jetpack-footer__a8c"
				href="https://jetpack.com/redirect/?source=a8c-about"
				rel="noopener noreferrer"
				target="_blank"
			>
				<AutomatticBylineLogo height={ 8 } />
			</a>
		</Stack>
	);
};

export default JetpackFooter;
