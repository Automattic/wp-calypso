/** @format */

/**
 * Internal dependencies
 */

import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_COMPUTED_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET,
	IMAGE_EDITOR_STATE_RESET_ALL,
	IMAGE_EDITOR_IMAGE_HAS_LOADED,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { AspectRatios } from './constants';

export const defaultTransform = {
	degrees: 0,
	scaleX: 1,
	scaleY: 1,
};

export const defaultFileInfo = {
	src: '',
	fileName: 'default',
	mimeType: 'image/png',
	title: 'default',
};

export const defaultCropBounds = {
	topBound: 0,
	leftBound: 0,
	bottomBound: 100,
	rightBound: 100,
};

export const defaultCrop = {
	topRatio: 0,
	leftRatio: 0,
	widthRatio: 1,
	heightRatio: 1,
};

export function hasChanges( state = false, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_SET_ASPECT_RATIO:
		case IMAGE_EDITOR_CROP:
		case IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE:
		case IMAGE_EDITOR_FLIP:
			return true;

		case IMAGE_EDITOR_STATE_RESET:
		case IMAGE_EDITOR_STATE_RESET_ALL:
			return false;

		case IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO:
		case IMAGE_EDITOR_COMPUTED_CROP:
			return state;
	}

	return state;
}

export const originalAspectRatio = createReducer( null, {
	[ IMAGE_EDITOR_IMAGE_HAS_LOADED ]: ( state, { width, height } ) => {
		return { width, height };
	},
	[ IMAGE_EDITOR_STATE_RESET_ALL ]: () => null,
} );

export function imageIsLoading( state = true, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_IMAGE_HAS_LOADED:
			return false;

		case IMAGE_EDITOR_STATE_RESET_ALL:
			return true;
	}

	return state;
}

export function fileInfo( state = defaultFileInfo, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_SET_FILE_INFO:
			const { src, fileName, mimeType, title } = action;
			return { ...state, src, fileName, mimeType, title };

		case IMAGE_EDITOR_STATE_RESET_ALL:
			return {
				...state,
				...defaultFileInfo,
			};
	}

	return state;
}

export function transform( state = defaultTransform, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE:
			return Object.assign( {}, state, { degrees: ( state.degrees - 90 ) % 360 } );
		case IMAGE_EDITOR_FLIP:
			return Object.assign( {}, state, { scaleX: -state.scaleX } );
		case IMAGE_EDITOR_STATE_RESET:
		case IMAGE_EDITOR_STATE_RESET_ALL:
			return Object.assign( {}, defaultTransform );
	}

	return state;
}

export function cropBounds( state = defaultCropBounds, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_SET_CROP_BOUNDS:
			return Object.assign( {}, state, {
				topBound: action.topBound,
				leftBound: action.leftBound,
				bottomBound: action.bottomBound,
				rightBound: action.rightBound,
			} );
	}

	return state;
}

export function crop( state = defaultCrop, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_CROP:
		case IMAGE_EDITOR_COMPUTED_CROP:
			return Object.assign( {}, state, {
				topRatio: action.topRatio,
				leftRatio: action.leftRatio,
				widthRatio: action.widthRatio,
				heightRatio: action.heightRatio,
			} );
		case IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE:
			return {
				topRatio: 1 - state.widthRatio - state.leftRatio,
				leftRatio: state.topRatio,
				widthRatio: state.heightRatio,
				heightRatio: state.widthRatio,
			};
		case IMAGE_EDITOR_FLIP:
			return Object.assign( {}, state, {
				leftRatio: 1 - state.widthRatio - state.leftRatio,
			} );
		case IMAGE_EDITOR_STATE_RESET:
		case IMAGE_EDITOR_STATE_RESET_ALL:
			return Object.assign( {}, defaultCrop );
	}

	return state;
}

export function aspectRatio( state = AspectRatios.FREE, action ) {
	switch ( action.type ) {
		case IMAGE_EDITOR_SET_ASPECT_RATIO:
		case IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO:
			return action.ratio;
		case IMAGE_EDITOR_STATE_RESET:
		case IMAGE_EDITOR_STATE_RESET_ALL:
			const { additionalData = {} } = action;
			const { aspectRatio: payloadAspectRatio } = additionalData;

			if ( payloadAspectRatio && AspectRatios[ payloadAspectRatio ] ) {
				return payloadAspectRatio;
			}

			return AspectRatios.FREE;
	}

	return state;
}

export default combineReducers( {
	hasChanges,
	fileInfo,
	transform,
	cropBounds,
	crop,
	aspectRatio,
	originalAspectRatio,
	imageIsLoading,
} );
