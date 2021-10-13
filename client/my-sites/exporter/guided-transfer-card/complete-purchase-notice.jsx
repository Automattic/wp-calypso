import { localize } from 'i18n-calypso';
import page from 'page';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const redirectToCart = ( siteSlug ) => () => {
	page( `/checkout/${ siteSlug }/guided_transfer` );
};

const CompletePurchaseNotice = ( { translate, siteSlug } ) => (
	<Notice
		status="is-warning"
		showDismiss={ false }
		text={ translate(
			"It looks like you've started a Guided Transfer. " +
				'We just need your payment to confirm the transfer and ' +
				"then we'll get started!"
		) }
	>
		<NoticeAction onClick={ redirectToCart( siteSlug ) }>{ translate( 'Continue' ) }</NoticeAction>
	</Notice>
);

const mapStateToProps = ( state ) => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( CompletePurchaseNotice ) );
