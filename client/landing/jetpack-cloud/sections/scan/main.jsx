/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ProgressBar } from '@automattic/components';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { withLocalizedMoment } from 'components/localized-moment';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import ThreatItem from '../../components/threat-item';
import { isEnabled } from 'config';
import ThreatDialog from '../../components/threat-dialog';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

import './style.scss';

// This is here for testing purposes only. Once the ThreatItem component
// is merged into master, we would be able to connect this two pieces of
// UI.
const ComponentToTestDialogs = ( { siteName, threat } ) => {
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const [ actionToPerform, setActionToPerform ] = React.useState();

	const openDialog = action => {
		setActionToPerform( action );
		setShowThreatDialog( true );
	};

	const closeDialog = () => {
		setShowThreatDialog( false );
	};

	const confirmAction = () => {
		window.alert( `Fixing site: ${ siteName }` );
		closeDialog();
	};

	return (
		<>
			<Button onClick={ () => openDialog( 'fix' ) }>Open Fix Dialog</Button>
			<Button onClick={ () => openDialog( 'ignore' ) }>Open Ignore Dialog</Button>
			<ThreatDialog
				showDialog={ showThreatDialog }
				onCloseDialog={ closeDialog }
				onConfirmation={ confirmAction }
				siteName={ siteName }
				threatTitle={ threat.title }
				threatDescription={ threat.details }
				action={ actionToPerform }
			/>
		</>
	);
};

class ScanPage extends Component {
	renderScanOkay() {
		const { siteSlug, moment, lastScanTimestamp } = this.props;

		return (
			<>
				<SecurityIcon />
				<h1 className="scan__header scan__header--okay">
					{ translate( 'Don’t worry about a thing' ) }
				</h1>
				<p>
					The last Jetpack scan ran <strong>{ moment( lastScanTimestamp ).fromNow() }</strong> and
					everything looked great.
				</p>
				{ isEnabled( 'jetpack-cloud/on-demand-scan' ) && (
					<Button
						primary
						href={ `/scan/${ siteSlug }/?scan-state=scanning` }
						className="scan__button"
					>
						{ translate( 'Scan now' ) }
					</Button>
				) }
			</>
		);
	}

	renderScanning() {
		return (
			<>
				<SecurityIcon icon="in-progress" />
				<h1 className="scan__header scan__header--okay">{ translate( 'Preparing to scan' ) }</h1>
				<ProgressBar value={ 1 } total={ 100 } color="#069E08" />
				<p>
					Welcome to Jetpack Scan, we are taking a first look at your site now and the results will
					be with you soon.
				</p>
				<p>
					We will send you an email once the scan completes, in the meantime feel free to continue
					to use your site as normal, you can check back on progress at any time.
				</p>
			</>
		);
	}

	renderThreats() {
		const { threats, site } = this.props;

		return (
			<>
				<SecurityIcon icon="error" />
				<h1 className="scan__header">{ translate( 'Your site may be at risk' ) }</h1>
				<p>
					{ translate(
						'The scan found {{strong}}%(threatCount)s{{/strong}} potential threat with {{strong}}%(siteName)s{{/strong}}.',
						'The scan found {{strong}}%(threatCount)s{{/strong}} potential threats with {{strong}}%(siteName)s{{/strong}}.',
						{
							args: {
								siteName: site.name,
								threatCount: numberFormat( threats.length ),
							},
							components: { strong: <strong /> },
							comment:
								'%(threatCount)s represents the number of threats currently identified on the site, and $(siteName)s is the name of the site.',
							count: threats.length,
						}
					) }
					<br />
					{ translate(
						'Please review them below and take action. We are {{a}}here to help{{/a}} if you need us.',
						{
							components: { a: <a href="https://jetpack.com/contact-support/" /> },
							comment: 'The {{a}} tag is a link that goes to a contact support page.',
						}
					) }
				</p>
				<div className="scan__threats">
					{ threats.map( threat => (
						<ThreatItem key={ threat.id } threat={ threat } />
					) ) }
				</div>
			</>
		);
	}

	renderScanError() {
		const { siteSlug } = this.props;

		return (
			<>
				<SecurityIcon icon="scan-error" />
				<h1 className="scan__header">{ translate( 'Something went wrong' ) }</h1>
				<p>
					The scan did not complete successfully. In order to complete the scan you need to contact
					support.
				</p>
				<Button
					primary
					target="_blank"
					rel="noopener noreferrer"
					href={ `https://jetpack.com/contact-support/?scan-state=error&site-slug=${ siteSlug }` }
					className="scan__button"
				>
					{ translate( 'Contact Support {{externalIcon/}}', {
						components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
					} ) }
				</Button>
			</>
		);
	}

	renderScanState() {
		switch ( this.props.scanState ) {
			case 'okay':
				return this.renderScanOkay();
			case 'scanning':
				return this.renderScanning();
			case 'threats':
				return this.renderThreats();
			case 'error':
				return this.renderScanError();
		}
	}

	render() {
		const { threats, site } = this.props;

		return (
			<Main className="scan__main">
				<DocumentHead title="Scanner" />
				<SidebarNavigation />
				<div className="scan__content">
					{ this.renderScanState() }
					<ComponentToTestDialogs threat={ threats[ 0 ] } siteName={ site.name } />
				</div>
				<StatsFooter
					header="Scan Summary"
					stats={ [
						{ name: 'Files', number: 1201 },
						{ name: 'Plugins', number: 4 },
						{ name: 'Themes', number: 3 },
					] }
					noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backups has you covered."
					noticeLink="https://jetpack/upgrade/backups"
				/>
			</Main>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteSlug = getSelectedSiteSlug( state );

	// TODO: Get state from actual API.
	const params = new URL( document.location ).searchParams;
	const scanState = params.get( 'scan-state' ) || 'okay';

	// TODO: Get threats from actual API.
	const threats = [
		{
			id: 1,
			title: 'Infected core file: index.php',
			action: null,
			detectionDate: '23 September, 2019',
			actionDate: null,
			description: {
				title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
				problem:
					'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
				fix:
					'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.',
				details: 'This threat was found in the file: /htdocs/index.php',
			},
		},
		{
			id: 2,
			title: 'Infected Plugin: Contact Form 7',
			action: null,
			detectionDate: '17 September, 2019',
			actionDate: null,
			description: {
				title:
					'Unexpected file baaaaaad--file.php contains malicious code and is not part of the Plugin',
				problem:
					'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
				fix:
					'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.',
				details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
			},
		},
	];

	const lastScanTimestamp = Date.now() - 5700000; // 1h 35m.
	const nextScanTimestamp = Date.now() + 5700000;

	return {
		site,
		siteSlug,
		scanState,
		lastScanTimestamp,
		nextScanTimestamp,
		threats,
	};
} )( withLocalizedMoment( ScanPage ) );
