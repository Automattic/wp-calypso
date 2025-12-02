import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Suspense } from 'react';
import { Loading } from '../loading';
import { DevicesSettings } from './device-settings';
import { EmailSettings } from './email-settings';
import { WebSettings } from './web-settings';
import './index.scss';

interface Props {
	className?: string;
	siteId: number;
}

export const SiteSettings = ( { className, siteId }: Props ) => {
	return (
		<div className={ clsx( 'site-settings', className ) }>
			<Suspense fallback={ <Loading style={ { minHeight: '500px' } } /> }>
				<TabPanel
					tabs={ [
						{
							name: 'web',
							title: __( 'Web' ),
						},
						{
							name: 'email',
							title: __( 'Email' ),
						},
						{
							name: 'devices',
							title: __( 'Devices' ),
						},
					] }
				>
					{ ( tab ) => {
						switch ( tab.name ) {
							case 'web':
								return <WebSettings siteId={ siteId } />;
							case 'email':
								return <EmailSettings siteId={ siteId } />;
							case 'devices':
								return <DevicesSettings siteId={ siteId } />;
						}
					} }
				</TabPanel>
			</Suspense>
		</div>
	);
};
