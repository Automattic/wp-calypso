/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
    overEvery as and,
} from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
    makeTour,
    Tour,
    Step,
    ButtonRow,
    Next,
    Quit,
    Continue,
} from 'layout/guided-tours/config-elements';
import {
    isNewUser,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const FeaturedImageTour = makeTour(
    <Tour
        name="featuredImageTour"
        version="20170323"
        path={ [ '/post', '/page' ] }
            when={ and(
            isDesktop,
            isNewUser,
            ) }
        >
        <Step
            name="init"
            arrow="right-top"
            target=".editor-ground-control__toggle-sidebar"
            placement="beside"
            style={ { marginTop: '-9px' } }
        >
        <p>Set a featured image in the Post Settings panel.</p>
        <ButtonRow>
            <Next step="open-featured-images">
                Show me how!
            </Next>
            <Quit>
                Quit
            </Quit>
        </ButtonRow>
        </Step>

        /** The next two steps use the width: 410px as a hack to make the positioning work. 
        *** Without it, they sort of 'float' to the left of their designated targets.
        *** Recommended alternatives are welcomed.
        **/

        <Step
            name="open-featured-images"
            arrow="right-top"
            target=".editor-drawer__taxonomies + .accordion"
            placement="beside"
            style={ { width: '410px' } }
        >
            <Continue click step="click-featured-image-button" target=".editor-drawer__taxonomies + .accordion">
                Toggle the Featured Image section
            </Continue>
        </Step>

        <Step
            name="click-featured-image-button"
            arrow="right-top"
            target="button.editor-drawer-well__placeholder"
            placement="beside"  
            style={ { width: '410px' } }          
        >
            <Continue click step="select-featured-image" target=".editor-drawer__taxonomies + .accordion .editor-drawer-well__placeholder">
                Click "Set Featured Image"
            </Continue> 
        </Step>

        <Step
            name="select-featured-image"
            arrow="left-top"
            target=".media-library__upload-buttons"
            placement="beside"
            style={ { marginTop: '-24px' } }
        >
        <p>
            Add a new image, or select one below.
        </p>
        <ButtonRow>
            <Next step="set-featured-image">
                Next
            </Next>
        </ButtonRow>
        </Step>

        <Step
            name="set-featured-image"
            arrow="right-middle"
            target=".dialog__action-buttons .is-primary"
            placement="beside"
            style={ { marginTop: '-24px' } }
        >

        <Continue click step="endTour" target=".dialog__action-buttons .is-primary">
            After selecting an image, click "Set Featured Image"
        </Continue>
        </Step>

        <Step
            name="endTour"
            target=".editor-ground-control__toggle-sidebar"
            placement="beside"
        >
        <p>Nice work! Your Featured Image is ready!</p>
        <ButtonRow>
            <Quit>Quit</Quit>
        </ButtonRow>
        </Step>
    </Tour>
);
