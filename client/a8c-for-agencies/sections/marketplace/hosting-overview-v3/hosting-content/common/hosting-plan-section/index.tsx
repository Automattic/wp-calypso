import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import { Children } from 'react';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';

import './style.scss';

type BaseProps = {
	className?: string;
	children: React.ReactNode;
};

type AsideProps = BaseProps & {
	heading: string;
	cta?: {
		variant: 'primary' | 'secondary';
		icon?: JSX.Element;
		label: string;
		onClick?: () => void;
		disabled?: boolean;
		href?: string;
		target?: string;
	};
};

type HostingPlanSectionProps = BaseProps & {
	heading?: string;
};

function Banner( { children }: BaseProps ) {
	return <div className="hosting-plan-section__banner">{ children }</div>;
}

function Aside( { heading, cta, children }: AsideProps ) {
	return (
		<aside className="hosting-plan-section__aside">
			<div className="hosting-plan-section__aside-top">
				<h3 className="hosting-plan-section__aside-heading">{ heading }</h3>
				<div className="hosting-plan-section__aside-content">{ children }</div>
			</div>

			<footer className="hosting-plan-section__aside-footer">
				{ cta && (
					<Button
						className="hosting-plan-section__aside-button"
						variant={ cta.variant }
						onClick={ cta.onClick }
						disabled={ cta.disabled }
						{ ...( cta.href && { href: cta.href, target: cta.target } ) }
					>
						{ cta.label }
						{ cta.icon && <Icon icon={ cta.icon } size={ 16 } /> }
					</Button>
				) }
			</footer>
		</aside>
	);
}

function Card( { children }: BaseProps ) {
	return <div className="hosting-plan-section__card">{ children }</div>;
}

type DetailsProps = BaseProps & {
	heading: TranslateResult;
};

function Details( { children, heading }: DetailsProps ) {
	return (
		<div className="hosting-plan-section__details">
			{ heading && <h3 className="hosting-plan-section__details-heading">{ heading }</h3> }
			<div className="hosting-plan-section__details-content">{ children }</div>
		</div>
	);
}

export default function HostingPlanSection( {
	children,
	className,
	heading,
}: HostingPlanSectionProps ) {
	const banner = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === Banner
	);

	const card = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === Card
	);

	const aside = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === Aside
	);

	const detail = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === Details
	);

	return (
		<PageSection className={ clsx( 'hosting-plan-section', className ) } heading={ heading }>
			{ banner }

			<div className="hosting-plan-section__content">
				<main className="hosting-plan-section__main">
					{ card }
					{ detail }
				</main>
				{ aside }
			</div>
		</PageSection>
	);
}

HostingPlanSection.Banner = Banner;
HostingPlanSection.Card = Card;
HostingPlanSection.Aside = Aside;
HostingPlanSection.Details = Details;
