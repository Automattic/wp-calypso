/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { localize } from 'i18n-calypso';

const ActionRemove = props => (
    <button
        title={props.translate('Remove', { textOnly: true })}
        {...omit(props, 'moment', 'numberFormat', 'translate')}
        className={classNames('action-remove', props.className)}
    >
        {props.children}
    </button>
);

export default localize(ActionRemove);
