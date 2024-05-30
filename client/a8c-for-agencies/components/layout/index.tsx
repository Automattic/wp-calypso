import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { GuidedTourContextProvider } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import useGuidedTours from 'calypso/a8c-for-agencies/data/guided-tours/use-guided-tours';
import {
	A4A_ONBOARDING_TOURS_PREFERENCE_NAME,
	A4A_ONBOARDING_TOURS_EVENT_NAMES,
} from 'calypso/a8c-for-agencies/sections/onboarding-tours/constants';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import LayoutColumn from './column';

import './style.scss';

type Props = {
	children: ReactNode;
	sidebarNavigation?: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
	withBorder?: boolean;
	compact?: boolean;
};

function MainLayout( {
	children,
	className,
	title,
	wide,
	withBorder,
	compact,
	sidebarNavigation,
}: Props ) {
	const hasLayoutColumns = React.Children.toArray( children ).some(
		( child ) => React.isValidElement( child ) && child.type === LayoutColumn
	);
	const layoutContainerClassname = hasLayoutColumns
		? 'a4a-layout-with-columns__container'
		: 'a4a-layout__container';

	return (
		<Main
			className={ classNames( 'a4a-layout', className, {
				'is-with-border': withBorder,
				'is-compact': compact,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			{ sidebarNavigation }

			<div className={ layoutContainerClassname }>{ children }</div>
		</Main>
	);
}

function MainLayoutWithGuidedTour( { ...props }: Props ) {
	const guidedTours = useGuidedTours();

	return (
		<GuidedTourContextProvider
			guidedTours={ guidedTours }
			preferenceNames={ A4A_ONBOARDING_TOURS_PREFERENCE_NAME }
			eventNames={ A4A_ONBOARDING_TOURS_EVENT_NAMES }
		>
			<MainLayout { ...props } />
		</GuidedTourContextProvider>
	);
}

export default function Layout( {
	disableGuidedTour = false,
	...props
}: Props & { disableGuidedTour?: boolean } ) {
	if ( disableGuidedTour ) {
		return <MainLayout { ...props } />;
	}

	return <MainLayoutWithGuidedTour { ...props } />;
}
