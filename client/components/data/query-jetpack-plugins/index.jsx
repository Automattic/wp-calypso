/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchPlugins } from 'state/plugins/installed/actions';
import { isRequestingForSites } from 'state/plugins/installed/selectors';

class QueryJetpackPlugins extends Component {
    componentWillMount() {
        if (this.props.siteIds && !this.props.isRequestingForSites) {
            this.props.fetchPlugins(this.props.siteIds);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (isEqual(nextProps.siteIds, this.props.siteIds)) {
            return;
        }
        this.refresh(nextProps.isRequestingForSites, nextProps.siteIds);
    }

    refresh(isRequesting, siteIds) {
        if (!isRequesting) {
            this.props.fetchPlugins(siteIds);
        }
    }

    render() {
        return null;
    }
}

QueryJetpackPlugins.propTypes = {
    siteIds: PropTypes.array.isRequired,
    isRequestingForSites: PropTypes.bool,
    fetchPlugins: PropTypes.func,
};

export default connect(
    (state, props) => {
        return {
            isRequestingForSites: isRequestingForSites(state, props.siteIds),
        };
    },
    { fetchPlugins }
)(QueryJetpackPlugins);
