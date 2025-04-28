using SimpleBlog.Services;

namespace SimpleBlog
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddRazorPages();
            //builder.Services.AddServerSideBlazor();
            builder.Services.AddServerSideBlazor()
                // Die default Receive Size ist 32KB. Das führt zu Problemen beim speichern der
                // Einträge wenn Bilder als Base64 enthalten sind!
                .AddHubOptions(options =>
                 {
                     options.MaximumReceiveMessageSize = 10 * 1024 * 1024; // 10 MB 
                 });

            // Dummy Service um die Einträge als Json lokal zu speichern
            builder.Services.AddSingleton<BlogService>();

            // Dummy ImageService um Images als Datei zu speichern anstelle Base64
            builder.Services.AddControllers();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            // Dummy ImageService mappen 
            app.MapControllers();

            app.UseStaticFiles();

            app.UseRouting();

            app.MapBlazorHub();
            app.MapFallbackToPage("/_Host");

            app.Run();
        }
    }
}
