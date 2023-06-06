import { __ } from '@wordpress/i18n';
import { translate, useTranslate } from 'i18n-calypso';
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import useCampaignsQueryNew from 'calypso/data/promote-post/use-promote-post-campaigns-query-new';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	formatNumber,
	formatCents,
	getCampaignDurationFormatted,
	getCampaignEstimatedImpressions,
} from '../../utils';
import CampaignItemDetails from '../campaign-item-details';
import './style.scss';

interface Props {
	campaignId: number;
}

const noCampaignListMessage = translate(
	'There was a problem obtaining the campaign. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
	}
);

export default function CampaignItemPage( props: Props ) {
	// const { campaignId } = props;
	const campaignId = 5901;

	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || 0;
	// const campaignQuery = useCampaignsQueryNew( siteId || 0, campaignId );

	// @ts-ignore
	const campaignQuery = {
		data: {
			campaign_id: 5900,
			name: 'How to Find, Access, and Edit functio...',
			description: null,
			owner_id: 1,
			start_date: '2023-05-26T00:00:00.000Z',
			end_date: '2023-06-01T23:59:59.000Z',
			status_smart: 0,
			status: 'active',
			subscription_id: 3676,
			display_name: 'Javier Olmo',
			avatar_url: 'https://0.gravatar.com/avatar/9f20b48584142081af80be29ffc6dddc?s=96&d=identicon',
			budget_cents: 500,
			target_urn: 'urn:wpcom:post:20115252:181817',
			target_url: 'http://jetpack.com/2022/08/23/wordpress-functions-php/',
			user_target_language: null,
			user_target_geo: '0',
			user_target_geo2: null,
			device_target_type: 'all',
			os_target_type: '',
			content_target_language: '0',
			content_target_iab_category: '0',
			keyword_target_ids: null,
			keyword_target_kvs: null,
			type: 'post',
			placement: null,
			site_names: null,
			page_names: null,
			display_delivery_estimate: '17900:24200',
			smart_delivery_estimate: '35000',
			delivery_percent: 0,
			moderation_status: null,
			moderation_reason: 'pending',
			mime_type: 'application/json',
			width: 300,
			height: 250,
			alt_text: null,
			file_name: null,
			creative_asset_id: 1,
			smart_id: null,
			content_config: {
				title: 'How to Find, Access, and Edit functio...',
				snippet: 'Everything you need to know about functions.php. How to find, access, edit, &...',
				clickUrl: 'http://jetpack.com/2022/08/23/wordpress-functions-php/',
				imageUrl: '/api/v1/dsp/creatives/2/image',
			},
			image_mime_type: 'image/jpeg',
			content_image: 'undefined',
			audience_list: {
				devices: 'All',
				countries: 'Everywhere',
				topics: 'All topics',
				OSs: '',
			},
			creative_html:
				'<html lang=en>    <head>        <base target=_blank>        <meta charset=utf-8>        <meta name=viewport content="width=device-width,initial-scale=1">        <script src=//ns.sascdn.com/diff/templates/js/banner/sas-clicktag-3.1.js></script>        <style>html, body, div, span, applet, object, iframe,        h1, h2, h3, h4, h5, h6, p, blockquote, pre,        a, abbr, acronym, address, big, cite, code,        del, dfn, em, img, ins, kbd, q, s, samp,        small, strike, strong, sub, sup, tt, var,        b, u, i, center,        dl, dt, dd, ol, ul, li,        fieldset, form, label, legend,        table, caption, tbody, tfoot, thead, tr, th, td,        article, aside, canvas, details, embed,        figure, figcaption, footer, header, hgroup,        menu, nav, output, ruby, section, summary,        time, mark, audio, video {            margin: 0;            padding: 0;            border: 0;            font-size: 100%;            font: inherit;            vertical-align: baseline;        }        article, aside, details, figcaption, figure,        footer, header, hgroup, menu, nav, section {            display: block;        }        body {            line-height: 1;        }        ol, ul {            list-style: none;        }        blockquote, q {            quotes: none;        }        blockquote:before, blockquote:after,        q:before, q:after {            content: "";            content: none;        }        table {            border-collapse: collapse;            border-spacing: 0;        }        </style>        <style>            .UUwUmsTLmY {              width: 300px;              height: 250px;              box-sizing: border-box;              align-content: start;              flex-wrap: nowrap;              display: flex;              flex-direction: column;              justify-content: space-between;              overflow: hidden;              background: #FFFFFF;              border: 1px solid rgba(0, 0, 0, 0.15);              border-radius: 3px;              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue",sans-serif;              position: relative;            }            .WPqOqEOMMs {              background-color: #ffffff;              box-sizing: border-box;              font-weight: bold;              flex-shrink: 0;              flex-basis: auto;              min-height: 0;              padding: 12px;              font-size: 13px;              line-height: 16px;              z-index: 1;            }            .WPqOqEOMMs:empty {              visibility: hidden;            }            .YVoSwmwmsh {              position: absolute;              box-sizing: border-box;              flex-grow: 3;              flex-shrink: 2;              flex-basis: 146px;              min-height: 0;              overflow: hidden;              z-index: 0;            }            .YVoSwmwmsh img {              width: 100%;              height: 100%;              flex-shrink: 1;            }            .JZzxDUGJqc {              flex-basis: auto;              background-color: #ffffff;              white-space: pre-line;              font-weight: 400;              min-height: 0;              padding: 12px;              font-size: 15px;              flex-shrink: 0;              line-height: 21px;              z-index: 1;            }            .JZzxDUGJqc:empty {              visibility: hidden;            }            .no-image {              display: flex;              justify-content: center;              align-items: center;              height: 100%;              color: #50575E;              background-color: #fcfcfc;            }            .no-image span {              display: block;              margin-top: 10px;              font-style: italic;            }        </style>    </head>    <body>    <a href="http://jetpack.com/2022/08/23/wordpress-functions-php/" id="click-area1" style="text-decoration: none; color: #000;">        <div class="UUwUmsTLmY click-area1" onmouseover="this.style.cursor=pointer;">            <div class="WPqOqEOMMs" id="title">How to Find, Access, and Edit functio...</div>            <div class="YVoSwmwmsh"><img crossorigin="anonymous" style="width: 100%;" id="imageUrl" alt="image" src="https://i0.wp.com/public-api.wordpress.com/wpcom/v2/wordads/dsp/api/v1/dsp/creatives/21672/image?zoom=2&h=250"></div>            <div class="JZzxDUGJqc" id="snippet">Everything you need to know about functions.php. How to find, access, edit, &...</div>        </div>    </a>    </body></html>',
			campaign_stats: {
				impressions_total: 1000,
				clicks_total: 235,
				clickthrough_rate: 23.5,
				duration_days: 7,
				budget: null,
				budget_left: null,
				spent_budget_cents: 100000,
				total_budget: null,
				total_budget_used: 1000,
				total_budget_left: null,
				campaign_days: 7,
				overall_spending: 1000,
				visits_organic: 765,
				visits_total: 1000,
				visits_organic_rate: 0.765,
				visits_ad_rate: 0.235,
			},
			billing_data: {
				payment_method: 'Visa **** 4242',
				subtotal: 183,
				credits: 0,
				currency: 'USD',
				total: 183,
				card_name: 'Jose Javier Olmo Gil',
			},
		},
	};

	const { isLoading: campaignsIsLoading, isError } = campaignQuery;
	const { data: campaign } = campaignQuery;

	useEffect( () => {
		document.querySelector( 'body' )?.classList.add( 'is-section-promote-post-i2' );
	}, [] );

	if ( isError ) {
		return (
			<Notice status="is-error" icon="mention">
				{ noCampaignListMessage }
			</Notice>
		);
	}

	if ( ! campaign || campaignsIsLoading ) {
		return <CampaignItemDetails isLoading={ true } />;
	}

	if ( campaignsIsLoading ) {
		return null;
	}

	return (
		<Main wideLayout className="promote-post-i2">
			<DocumentHead title={ translate( 'Advertising - Campaign details' ) } />
			<CampaignItemDetails siteId={ +siteId } campaign={ campaign } />
		</Main>
	);
}
