import { useRouterState } from '@tanstack/react-router';
import { useViewportMatch } from '@wordpress/compose';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SnackbarBackButton, {
	getSnackbarBackButtonText,
} from '../../components/snackbar-back-button';
import HostingFeatureGate from '../hosting-feature-gate';
import ActivationCallout from './activation';
import UpsellCallout, { UpsellCalloutProps } from './upsell';
import type { HostingFeatureGateProps } from '../hosting-feature-gate';
import type { ReactNode } from 'react';

type HostingFeatureGatedWithCalloutProps = Omit<
	HostingFeatureGateProps,
	'renderUpsellComponent' | 'renderActivationComponent'
> &
	UpsellCalloutProps & {
		/**
		 * When true, wraps the callout in a PageLayout with EmptyState.Wrapper.
		 * Use this for top-level feature pages (backups, scan, etc.).
		 * When false or omitted, renders the callout inline (for settings subpages).
		 */
		fullPage?: boolean;
		title?: string;
	};

export default function HostingFeatureGatedWithCallout( {
	fullPage,
	title,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellDescription,
	...props
}: HostingFeatureGatedWithCalloutProps ) {
	const {
		location: { search },
	} = useRouterState();

	const { site, upsellId, upsellFeatureId, feature } = props;
	const isDesktop = useViewportMatch( 'medium' );

	const snackbarBackButtonText = getSnackbarBackButtonText( search.back_to );
	const backButton = snackbarBackButtonText && (
		<SnackbarBackButton>{ snackbarBackButtonText }</SnackbarBackButton>
	);

	const wrapCallout = ( callout: ReactNode ) => {
		if ( ! fullPage ) {
			return callout;
		}

		return (
			<PageLayout header={ <PageHeader title={ title } /> }>
				{ isDesktop ? (
					<EmptyState.Wrapper>
						<div style={ { maxWidth: '600px' } }>{ callout } </div>
					</EmptyState.Wrapper>
				) : (
					callout
				) }
			</PageLayout>
		);
	};

	return (
		<HostingFeatureGate
			{ ...props }
			renderUpsellComponent={ () => {
				const upsellCallout = (
					<UpsellCallout
						site={ site }
						upsellId={ upsellId }
						upsellFeatureId={ upsellFeatureId }
						upsellIcon={ upsellIcon }
						upsellImage={ upsellImage }
						upsellTitle={ upsellTitle }
						upsellDescription={ upsellDescription }
						feature={ feature }
					/>
				);

				return (
					<>
						{ wrapCallout( upsellCallout ) }
						{ backButton }
					</>
				);
			} }
			renderActivationComponent={ () => {
				const activationCallout = (
					<ActivationCallout
						site={ site }
						feature={ feature }
						tracksFeatureId={ upsellFeatureId ?? upsellId }
					/>
				);

				return (
					<>
						{ wrapCallout( activationCallout ) }
						{ backButton }
					</>
				);
			} }
		/>
	);
}
