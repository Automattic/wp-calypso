# Overview

This document describes the REST API envisioned to support a limited first iteration of the Share a Draft feature.

# Schema

## FeedbackRequest

| Name				| Type		| Description												|
| ----------------- | --------- | --------------------------------------------------------- |
| id				| uuid		| The feedback request ID. Read only. 						|
| link				| URL		| A URL to view and offer feedback on a draft.				|
| isEnabled			| boolean	| Indicates whether or not the share is enabled				|
| email				| string?	| Reviewer email address. Optional.							|

# Endpoints

## List feedback requests

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests`

Method: `GET`

### Response body

```json
[
	{
		"id": "42dd8eaf-c0cd-4cc5-a7ab-db31db0b7178",
		"link": "https://example.com?p=123&request-feedback=",
		"isEnabled": true,
		"email": "brandon@example.com",
	},
	{
		"id": "dee0325a-5f32-4c31-b8be-d8f4592dd22d",
		"link": "https://example.com?p=123&request-feedback=",
		"isEnabled": true,
		"email": "nikolay@example.com",
	}
]
```

## Create a feedback request

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests`

Method: `POST`

### Request body

```json
{
	"email": "dennis@example.com"
}
```

### Response body

```json
{
	"id": "e83b9042-3c6c-4388-96d4-f043e6727da0",
	"link": "https://example.com?p=123&request-feedback=e83b9042-3c6c-4388-96d4-f043e6727da0",
	"isEnabled": true,
	"email": "dennis@example.com",
}
```


## Update a feedback request

URI: `/sites/<site-id>/posts/<post-id>/feedback-requests/<id>`

Method: `PATCH`

### Request body

```json
{
	"isEnabled": false
}
```

### Response body

```json
{
	"id": "e83b9042-3c6c-4388-96d4-f043e6727da0",
	"link": "https://example.com?p=123&request-feedback=e83b9042-3c6c-4388-96d4-f043e6727da0",
	"isEnabled": false,
	"email": "dennis@example.com",
}
```
