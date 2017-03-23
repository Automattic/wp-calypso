/**
 * External dependencies
 */
import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import purchasesPaths from 'me/purchases/paths';
import supportUrls from 'lib/url/support';
import FormSectionHeading from 'components/forms/form-section-heading';
import HelpContactClosedDetail from './detail';

export default localize(props => {
    const { translate } = props;

    //In the date translated below 7am UTC is 12am/midnight PT
    return (
        <div className="help-contact-closed">
            <FormSectionHeading>{translate('Limited Support This Week')}</FormSectionHeading>
            <p>
                {translate(
                    'Private email and live chat support will be closed from %(closed_start_date)s through %(closed_end_date)s, ' +
                        'included. We will reopen private email support on %(email_open_date)s, and live chat support will be back as ' +
                        'usual on %(livechat_open_date)s.',
                    {
                        args: {
                            closed_start_date: i18n
                                .moment('Wed, 14 Sep 2016 07:00:00 +0000')
                                .format('dddd, MMMM Do, YYYY'),
                            closed_end_date: i18n
                                .moment('Wed, 23 Sep 2016 07:00:00 +0000')
                                .format('dddd, MMMM Do, YYYY'),
                            email_open_date: i18n
                                .moment('Thu, 22 Sept 2016 07:00:00 +0000')
                                .format('dddd, MMMM Do'),
                            livechat_open_date: i18n
                                .moment('Mon, 26 Sep 2016 07:00:00 +0000')
                                .format('dddd, MMMM Do'),
                        },
                    }
                )}
            </p>
            <p>
                {translate(
                    'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together ' +
                        'to work on improving our services, building new features, and learning how to better serve you, our users. ' +
                        'But never fear! If you need help in the meantime:'
                )}
            </p>
            <HelpContactClosedDetail icon="help">
                {translate(
                    'The {{link}}forums{{/link}} remain open and staffed during this time.',
                    {
                        components: {
                            link: (
                                <a
                                    href="https://forums.wordpress.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                        },
                    }
                )}
            </HelpContactClosedDetail>
            <HelpContactClosedDetail icon="credit-card">
                {translate(
                    'If you require a refund, you can still request one directly from your {{link}}Purchases{{/link}} ' +
                        'screen.',
                    {
                        components: {
                            link: <a href={purchasesPaths.purchasesRoot()} />,
                        },
                    }
                )}
            </HelpContactClosedDetail>
            <HelpContactClosedDetail icon="book">
                {translate(
                    'If you are new to WordPress.com we have a step-by-step {{guide_link}}guide{{/guide_link}} to all things WordPress. ' +
                        'You can find more details in our {{support_doc_link}}support documentation{{/support_doc_link}}. There we have ' +
                        'guides on {{get_started_link}}getting started{{/get_started_link}}, {{first_post_link}}writing your first ' +
                        'post{{/first_post_link}}, and {{find_readers_link}}finding your readers{{/find_readers_link}}.',
                    {
                        components: {
                            guide_link: (
                                <a
                                    href="https://learn.wordpress.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                            support_doc_link: (
                                <a
                                    href={supportUrls.SUPPORT_ROOT}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                            get_started_link: (
                                <a
                                    href={supportUrls.START}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                            first_post_link: (
                                <a
                                    href={supportUrls.CREATE}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                            find_readers_link: (
                                <a
                                    href={supportUrls.CONNECT}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                        },
                    }
                )}
            </HelpContactClosedDetail>
        </div>
    );
});
