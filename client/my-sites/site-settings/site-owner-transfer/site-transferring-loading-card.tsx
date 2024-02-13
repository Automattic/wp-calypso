import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import ActionPanel from 'calypso/components/action-panel';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import MasterbarStyled from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/masterbar-styled';

const ActionPanelStyled = styled( ActionPanel )( {
	fontSize: '14px',
	margin: '20% 30px 0 30px',
	fontWeight: 400,
	'.action-panel__body': {
		color: 'var(--studio-gray-70)',
	},
} );

export function SiteTransferringLoadingCard( {
	progress,
	error,
}: {
	progress: number;
	error: React.ReactNode | string;
} ) {
	const translate = useTranslate();

	const renderLoadingBar = () => {
		return (
			<>
				<p>{ translate( 'Hold tight. We are making it happen!' ) }</p>
				<LoadingBar key="transfer-site-loading-bar" progress={ progress } />
			</>
		);
	};

	const renderError = () => {
		return (
			<Notice status="is-error" showDismiss={ false }>
				<div data-testid="error">
					<p>{ error }</p>
				</div>
			</Notice>
		);
	};

	return (
		<>
			<DocumentHead title={ translate( 'Site Transfer' ) } />
			<Global
				styles={ css`
					body.is-section-settings,
					body.is-section-settings .layout__content {
						background: var( --studio-white );
					}
				` }
			/>
			<MasterbarStyled canGoBack={ false } />
			<Main>
				<ActionPanelStyled>{ ! error ? renderLoadingBar() : renderError() }</ActionPanelStyled>
			</Main>
		</>
	);
}
