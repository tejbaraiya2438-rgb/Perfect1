import * as THREE from "three";

import { OrbitControls } from
"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";


/* ==================================================
   SOU 3D DISHA
   DIGITAL TWIN / ARCHITECTURAL PROTOTYPE
================================================== */


/* --------------------------------
   SCENE
-------------------------------- */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x02070c);

scene.fog =
    new THREE.FogExp2(
        0x02070c,
        0.014
    );


/* --------------------------------
   CAMERA
-------------------------------- */

const camera =
    new THREE.PerspectiveCamera(
        50,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );

camera.position.set(
    42,
    32,
    46
);


/* --------------------------------
   RENDERER
-------------------------------- */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("canvas-container")
    .appendChild(renderer.domElement);


/* --------------------------------
   CONTROLS
-------------------------------- */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

controls.dampingFactor = 0.065;

controls.minDistance = 10;

controls.maxDistance = 100;

controls.maxPolarAngle =
    Math.PI * 0.49;

controls.target.set(
    0,
    12,
    0
);


/* ==================================================
   LIGHTING
================================================== */

scene.add(
    new THREE.AmbientLight(
        0x9edfff,
        1.25
    )
);

const mainLight =
    new THREE.PointLight(
        0x00aaff,
        220,
        120
    );

mainLight.position.set(
    0,
    35,
    5
);

scene.add(mainLight);

const sideLight =
    new THREE.PointLight(
        0x0066ff,
        100,
        80
    );

sideLight.position.set(
    -35,
    15,
    25
);

scene.add(sideLight);


/* ==================================================
   MATERIALS
================================================== */

const buildingMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x07314a,
        transparent: true,
        opacity: 0.23
    });


const outlineMaterial =
    new THREE.LineBasicMaterial({
        color: 0x52ddff,
        transparent: true,
        opacity: 0.9
    });


const floorMaterial =
    new THREE.LineBasicMaterial({
        color: 0x167fa7,
        transparent: true,
        opacity: 0.55
    });


const structuralMaterial =
    new THREE.LineBasicMaterial({
        color: 0x39aeca,
        transparent: true,
        opacity: 0.42
    });


const highlightMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.35
    });


/* ==================================================
   CAMPUS GROUND
================================================== */

const groundGeometry =
    new THREE.PlaneGeometry(
        120,
        120
    );

const groundMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x020b12
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

scene.add(ground);


/* ==================================================
   ARCHITECTURAL GRID
================================================== */

const grid =
    new THREE.GridHelper(
        110,
        44,
        0x155d79,
        0x082b3c
    );

grid.position.y = 0.02;

scene.add(grid);


/* ==================================================
   BUILDING CREATOR
================================================== */

function createBuilding({
    name,
    width,
    depth,
    floors,
    floorHeight,
    x,
    z
}) {

    const group =
        new THREE.Group();

    group.name = name;

    group.userData = {
        type: "building",
        buildingName: name,
        originalX: x,
        originalZ: z,
        originalY: 0
    };


    const totalHeight =
        floors * floorHeight;


    /* --------------------------------
       MAIN VOLUME
    -------------------------------- */

    const geometry =
        new THREE.BoxGeometry(
            width,
            totalHeight,
            depth
        );

    const body =
        new THREE.Mesh(
            geometry,
            buildingMaterial
        );

    body.position.y =
        totalHeight / 2;

    body.userData =
        group.userData;

    group.add(body);


    /* --------------------------------
       OUTER WIREFRAME
    -------------------------------- */

    const edges =
        new THREE.EdgesGeometry(
            geometry
        );

    const outline =
        new THREE.LineSegments(
            edges,
            outlineMaterial
        );

    outline.position.y =
        totalHeight / 2;

    group.add(outline);


    /* --------------------------------
       FLOOR LINES
    -------------------------------- */

    for (
        let floor = 1;
        floor < floors;
        floor++
    ) {

        const y =
            floor * floorHeight;

        const points = [

            new THREE.Vector3(
                -width / 2,
                y,
                -depth / 2
            ),

            new THREE.Vector3(
                width / 2,
                y,
                -depth / 2
            ),

            new THREE.Vector3(
                width / 2,
                y,
                depth / 2
            ),

            new THREE.Vector3(
                -width / 2,
                y,
                depth / 2
            ),

            new THREE.Vector3(
                -width / 2,
                y,
                -depth / 2
            )

        ];

        const floorGeometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);

        const floorLine =
            new THREE.Line(
                floorGeometry,
                floorMaterial
            );

        group.add(floorLine);
    }


    /* --------------------------------
       VERTICAL STRUCTURE
    -------------------------------- */

    const verticalCount = 6;

    for (
        let i = 1;
        i < verticalCount;
        i++
    ) {

        const xPosition =
            -width / 2 +
            (width / verticalCount) * i;

        const points = [

            new THREE.Vector3(
                xPosition,
                0,
                -depth / 2
            ),

            new THREE.Vector3(
                xPosition,
                totalHeight,
                -depth / 2
            ),

            new THREE.Vector3(
                xPosition,
                totalHeight,
                depth / 2
            ),

            new THREE.Vector3(
                xPosition,
                0,
                depth / 2
            )

        ];

        const verticalGeometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);

        const verticalLine =
            new THREE.Line(
                verticalGeometry,
                structuralMaterial
            );

        group.add(verticalLine);
    }


    group.position.set(
        x,
        0,
        z
    );


    scene.add(group);

    return group;
}


/* ==================================================
   SOU BUILDING MASSING
================================================== */

/*
   EA + EB are intentionally represented
   as a connected architectural wing.
*/

const EAEB =
    createBuilding({
        name: "EA / EB WING",
        width: 20,
        depth: 8,
        floors: 10,
        floorHeight: 3,
        x: -3,
        z: 0
    });


/*
   EB EXTENSION
*/

const EB =
    createBuilding({
        name: "EB EXTENSION",
        width: 8,
        depth: 8,
        floors: 10,
        floorHeight: 3,
        x: 11,
        z: 1
    });


/*
   Campus context blocks.
*/

const blockA =
    createBuilding({
        name: "BLOCK A",
        width: 10,
        depth: 11,
        floors: 7,
        floorHeight: 3,
        x: -19,
        z: -8
    });


const blockB =
    createBuilding({
        name: "BLOCK B",
        width: 11,
        depth: 8,
        floors: 8,
        floorHeight: 3,
        x: -19,
        z: 9
    });


const blockC =
    createBuilding({
        name: "BLOCK C",
        width: 10,
        depth: 12,
        floors: 6,
        floorHeight: 3,
        x: 18,
        z: -10
    });


/* ==================================================
   ROOM 820
================================================== */

const roomGeometry =
    new THREE.BoxGeometry(
        3,
        2.4,
        3
    );

const room820 =
    new THREE.Mesh(
        roomGeometry,
        highlightMaterial
    );

room820.position.set(
    -7,
    25.2,
    -2.6
);

EAEB.add(room820);


const roomEdges =
    new THREE.EdgesGeometry(
        roomGeometry
    );

const roomOutline =
    new THREE.LineSegments(
        roomEdges,
        new THREE.LineBasicMaterial({
            color: 0xffffff
        })
    );

room820.add(roomOutline);


/* ==================================================
   BUILDING LABEL
================================================== */

function createLabel(
    text,
    position,
    scale = 1
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 512;
    canvas.height = 128;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.font =
        "bold 40px Arial";

    context.textAlign =
        "center";

    context.fillStyle =
        "#a9efff";

    context.shadowColor =
        "#00bfff";

    context.shadowBlur = 12;

    context.fillText(
        text,
        256,
        72
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });


    const sprite =
        new THREE.Sprite(
            material
        );

    sprite.position.copy(
        position
    );

    sprite.scale.set(
        7 * scale,
        1.75 * scale,
        1
    );

    scene.add(sprite);

    return sprite;
}


createLabel(
    "EA / EB",
    new THREE.Vector3(
        -3,
        32,
        0
    ),
    1
);

createLabel(
    "BLOCK A",
    new THREE.Vector3(
        -19,
        22,
        -8
    ),
    .65
);

createLabel(
    "BLOCK B",
    new THREE.Vector3(
        -19,
        25,
        9
    ),
    .65
);

createLabel(
    "ROOM 820",
    new THREE.Vector3(
        -7,
        28,
        -2.6
    ),
    .55
);


/* ==================================================
   FLOOR LEVEL MARKERS
================================================== */

function addFloorMarkers(
    building,
    floors,
    floorHeight
) {

    for (
        let floor = 1;
        floor <= floors;
        floor++
    ) {

        const marker =
            createLabel(
                "F" + floor,
                new THREE.Vector3(
                    building.position.x -
                    11,
                    floor * floorHeight -
                    0.2,
                    building.position.z
                ),
                .25
            );

        marker.material.opacity =
            0.55;
    }
}


addFloorMarkers(
    EAEB,
    10,
    3
);


/* ==================================================
   CAMERA FOCUS
================================================== */

function focusBuilding(
    building,
    title,
    description
) {

    controls.target.set(
        building.position.x,
        15,
        building.position.z
    );

    camera.position.set(
        building.position.x + 32,
        26,
        building.position.z + 32
    );

    document
        .getElementById(
            "locationTitle"
        )
        .textContent = title;

    document
        .getElementById(
            "locationDescription"
        )
        .textContent = description;
}


function focusRoom820() {

    controls.target.set(
        -3,
        24,
        -1
    );

    camera.position.set(
        25,
        24,
        30
    );

    document
        .getElementById(
            "locationTitle"
        )
        .textContent =
        "ROOM 820";

    document
        .getElementById(
            "locationDescription"
        )
        .textContent =
        "IEEE Workspace • 8th Floor • EA / EB Wing";

    document
        .getElementById(
            "floorValue"
        )
        .textContent =
        "FLOOR 08";

    document
        .getElementById(
            "roomValue"
        )
        .textContent =
        "ROOM 820";
}


/* ==================================================
   SEARCH
================================================== */

const searchInput =
    document.getElementById(
        "searchInput"
    );


searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        if (
            query.includes("820") ||
            query.includes("ieee")
        ) {

            focusRoom820();

            return;
        }


        if (
            query.includes("eb")
        ) {

            focusBuilding(
                EB,
                "EB EXTENSION",
                "Extended section of the EA / EB academic wing."
            );

            return;
        }


        if (
            query.includes("ea")
        ) {

            focusBuilding(
                EAEB,
                "EA / EB WING",
                "Main ten-floor academic wing."
            );

            return;
        }


        if (
            query.includes("block a")
        ) {

            focusBuilding(
                blockA,
                "BLOCK A",
                "Campus building."
            );

            return;
        }


        if (
            query.includes("block b")
        ) {

            focusBuilding(
                blockB,
                "BLOCK B",
                "Campus building."
            );

            return;
        }


        if (
            query.includes("block c")
        ) {

            focusBuilding(
                blockC,
                "BLOCK C",
                "Campus building."
            );

            return;
        }

    }
);


/* ==================================================
   RESET
================================================== */

document
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        () => {

            camera.position.set(
                42,
                32,
                46
            );

            controls.target.set(
                0,
                12,
                0
            );

            document
                .getElementById(
                    "locationTitle"
                )
                .textContent =
                "EA / EB WING";

            document
                .getElementById(
                    "locationDescription"
                )
                .textContent =
                "Interactive Silver Oak University building model.";

            document
                .getElementById(
                    "floorValue"
                )
                .textContent =
                "ALL FLOORS";

            document
                .getElementById(
                    "roomValue"
                )
                .textContent =
                "CAMPUS";

            searchInput.value = "";
        }
    );


/* ==================================================
   TOP VIEW
================================================== */

document
    .getElementById(
        "topButton"
    )
    .addEventListener(
        "click",
        () => {

            camera.position.set(
                0,
                78,
                0.1
            );

            controls.target.set(
                0,
                0,
                0
            );
        }
    );


/* ==================================================
   EXPLODE
================================================== */

let exploded = false;

document
    .getElementById(
        "explodeButton"
    )
    .addEventListener(
        "click",
        () => {

            exploded =
                !exploded;

            const amount =
                exploded ? 7 : 0;


            EAEB.position.x =
                -3 - amount;

            EB.position.x =
                11 + amount;

            blockA.position.z =
                -8 - amount;

            blockB.position.z =
                9 + amount;

            blockC.position.x =
                18 + amount;
        }
    );


/* ==================================================
   CLICK DETECTION
================================================== */

const raycaster =
    new THREE.Raycaster();

const pointer =
    new THREE.Vector2();


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        pointer.x =
            (event.clientX /
            window.innerWidth) * 2 - 1;

        pointer.y =
            -(event.clientY /
            window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(
            pointer,
            camera
        );


        const objects =
            raycaster.intersectObjects(
                scene.children,
                true
            );


        for (
            const hit of objects
        ) {

            let object =
                hit.object;


            while (
                object.parent &&
                !object.userData.buildingName
            ) {

                object =
                    object.parent;
            }


            if (
                object.userData &&
                object.userData.buildingName
            ) {

                document
                    .getElementById(
                        "locationTitle"
                    )
                    .textContent =
                    object.userData.buildingName;

                document
                    .getElementById(
                        "locationDescription"
                    )
                    .textContent =
                    "Selected campus building.";

                break;
            }
        }

    }
);


/* ==================================================
   RESIZE
================================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


/* ==================================================
   ANIMATION
================================================== */

function animate() {

    requestAnimationFrame(
        animate
    );


    controls.update();


    const pulse =
        0.27 +
        Math.sin(
            performance.now() * 0.003
        ) * 0.08;

    highlightMaterial.opacity =
        pulse;


    renderer.render(
        scene,
        camera
    );
}


animate();


/* ==================================================
   LOADING SCREEN
================================================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                const loading =
                    document.getElementById(
                        "loading"
                    );

                loading.style.opacity =
                    "0";

                setTimeout(
                    () => {

                        loading.remove();

                    },
                    700
                );

            },
            900
        );
    }
);
