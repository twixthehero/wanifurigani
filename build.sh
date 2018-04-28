#!/bin/bash

MANIFEST=manifest.json

SRC_DIR=src

BUILD_DIR=build
CSS_DIR=$BUILD_DIR/css
IMAGES_DIR=$BUILD_DIR/images
JS_DIR=$BUILD_DIR/js

function run() {
    echo -n "Running '$1'..."
    $1

    if [ "$?" == "0" ]; then
        echo "Success"
    else
        echo "Failed"
        exit 1
    fi
}

if [ ! -d "$BUILD_DIR" ]; then
    run "mkdir $BUILD_DIR"
    run "mkdir $CSS_DIR"
    run "mkdir $IMAGES_DIR"
    run "mkdir $JS_DIR"
fi

run "cp -r $SRC_DIR/* $BUILD_DIR"
run "cp WK-JS-API-Wrapper/wanikani.js $JS_DIR"
run "cp $MANIFEST $BUILD_DIR"