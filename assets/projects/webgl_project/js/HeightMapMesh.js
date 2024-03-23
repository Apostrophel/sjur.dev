/**
 * Created by endre on 12.10.15.
 */

/**
 * Created by endre on 12.10.15.
 */

var HeightMapMesh = function(heightMapGeometry, material) {

    // Create the mesh as a widthSegements x heightSegments mesh, each cell is 1x1.
    THREE.Mesh.call(this, heightMapGeometry, material);

    this.type = 'HeightMapMesh';

    if (!(heightMapGeometry instanceof HeightMapBufferGeometry)) {
        console.error('HeightMapMesh: heightMapGeometry is not instance of HeightMapBufferGeometry', heightMapGeometry);
    }
};

HeightMapMesh.prototype = Object.create( THREE.Mesh.prototype );
HeightMapMesh.prototype.constructor = HeightMapMesh;

HeightMapMesh.prototype.getHeightAtPoint = function(localPos) {
    return this.computePositionAtPoint(localPos).y;
};

HeightMapMesh.prototype.computePositionAtPoint = function(localPos) {
    var inverse = new THREE.Matrix4().getInverse(this.matrix);
    var pos = new THREE.Vector4().copy(localPos);

    // Convert coordinates from possibly scaled, translated and rotated coordinates to object local coordinates.
    pos.applyMatrix4(inverse);

    var height = this.geometry.getHeightAtPoint(pos);

    pos.setY(height);

    pos.applyMatrix4(this.matrix);
    return pos;
};