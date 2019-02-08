function initializeGallery(){

galleryAPI.getAlbums(function(items)
{
    var html = "";

    for(var i = 0; i < items.length; i++)
    {
        var album = items[i];

        html += '<a href="javascript:loadAlbum(\'' + album.title + '\')" class="album"><span>' + escape(album.title) + '</span></a>';
    }

  $(".galleryImages").html( html );

}, function(error){alert(error);});
window.loadAlbum = function(albumName)
{
    galleryAPI.getMedia(albumName, function(items)
    {
        var html = "";
        var imgDisplayHtml="";
        for(var i = 0; i < 20; i++)
        {
            var media = items[i];

            html += '<div class="galleryComponent"><img src="'+media.thumbnail+'"><div class="imgDescription">'+media.title+'</div></div>';
            imgDisplayHtml+='<img src="'+media.thumbnail+'">';

        }

        $(".galleryImages").html( html );
        $("img").on("click",function(event){
          //get element index then * 100vw
          console.log($(this).index());
          console.log($('img').index(this));
          showImage(event.target,imgDisplayHtml);
        })

    }, function(error){alert(error);});
};
}

function showImage(currentImg,html){

$(".galleryImages").html( "" );
$(".galleryImages").html('<div class="imgDisplay">' + html + '</div>' );
console.log($(window).width());
$(".imgDisplay").scrollLeft($(window).width());
localStorage.setItem("lastPage",".galleryWrapper");
localStorage.setItem("currentPage",".imgWrapper");

}
